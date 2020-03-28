#!/bin/bash

# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


from os.path import join

from pandas.core.indexes.datetimes import DatetimeIndex

from covidvu.pipeline.vujson import JH_CSSE_FILE_CONFIRMED
from covidvu.pipeline.vujson import JH_CSSE_FILE_CONFIRMED_DEPRECATED
from covidvu.pipeline.vujson import JH_CSSE_FILE_DEATHS
from covidvu.pipeline.vujson import JH_CSSE_FILE_DEATHS_DEPRECATED
from covidvu.pipeline.vujson import JH_CSSE_REPORT_PATH
from covidvu.pipeline.vujson import SITE_DATA
from covidvu.pipeline.vujson import dumpJSON
from covidvu.pipeline.vujson import parseCSSE

import sys
import re
import os
import json

import numpy as np
import pandas as pd
import pystan
from pystan.model import StanModel

N_SAMPLES        = 3000
N_BURN           = 1000
N_CHAINS         = 3
N_DAYS_PREDICT   = 14
MIN_CASES_FILTER = 50
MIN_NUMBER_DAYS_WITH_CASES = 10

PRIOR_LOG_CARRYING_CAPACITY = (0, 5)
PRIOR_MID_POINT             = (0, 1000)
PRIOR_GROWTH_RATE           = (0.5, 0.5)
PRIOR_SIGMA                 = (0, 10)

PREDICTIONS_PERCENTILES = (
                                (2.5, 97.5),
                                (25, 75),
                          )


def _getCountryToTrain(countryTrainIndex, confirmedCases):
    topCountries = confirmedCases.iloc[-1, confirmedCases.columns.map(lambda c: c[0] != '!')]
    topCountries = topCountries.sort_values(ascending=False)
    countryName = topCountries.index[countryTrainIndex]
    return countryName


def buildLogisticModel(priorLogCarryingCapacity,
                       priorMidPoint,
                       priorGrowthRate,
                       priorSigma,
                       nDaysName='nDays',
                       timeName='t',
                       casesLogName='casesLog',
                       ) -> StanModel:
    logisticGrowthModel = f'''
    data {{
      int<lower=0> {nDaysName};
      vector[{nDaysName}] {timeName};
      vector[{nDaysName}] {casesLogName};
    }}
    parameters {{
      real logCarryingCapacity;
      real midPoint;
      real growthRate;
      real<lower=0> sigma;
    }}
    transformed parameters {{
        real carryingCap;
        vector[{nDaysName}] casesLin;
        carryingCap = pow(10, logCarryingCapacity);    
        casesLin = carryingCap * inv_logit(growthRate * ({timeName} - midPoint));    
    }}
    model {{
      logCarryingCapacity ~ normal({priorLogCarryingCapacity[0]},{priorLogCarryingCapacity[1]}) T[0,];
      midPoint ~ normal({priorMidPoint[0]}, {priorMidPoint[1]}) T[0,];
      growthRate ~ normal({priorGrowthRate[0]},{priorGrowthRate[1]});
      sigma ~ normal({priorSigma[0]},{priorSigma[1]}) T[0,];
      {casesLogName} ~ normal(log(casesLin + 1), sigma);
    }}
    '''
    logGrowthModel = pystan.StanModel(model_code=logisticGrowthModel)
    return logGrowthModel


def _getPredictionsFromPosteriorSamples(t,
                                        trace,
                                        nDaysPredict,
                                        predictionsPercentiles,
                                        ):

    tPredict = np.arange(len(t) + nDaysPredict)

    predictions = np.zeros((len(t)+nDaysPredict, trace.shape[0]))

    for i in range(trace.shape[0]):
        carryingCap = 10 ** trace['logCarryingCapacity'].iloc[i]

        predictions[:, i] = carryingCap / (
                1 + np.exp(-1.0 * trace['growthRate'].iloc[i] * (tPredict - trace['midPoint'].iloc[i])))

    predictionsPercentilesTS = []
    for qLow, qHigh in predictionsPercentiles:
        predictionsLow = np.percentile(predictions, qLow, axis=1)
        predictionsHigh = np.percentile(predictions, qHigh, axis=1)
        predictionsPercentilesTS.append([predictionsLow, predictionsHigh])
    predictionsMean = predictions.mean(axis=1)

    return predictionsMean, predictionsPercentilesTS


def _castPredictionsAsTS(countryTSClean,
                         nDaysPredict,
                         predictionsMean,
                         predictionsPercentiles,
                         ):
    predictionsMeanTS = pd.Series(
        index = pd.date_range(
                                start = countryTSClean.index[0],
                                end   = countryTSClean.index[-1] + pd.Timedelta(nDaysPredict, 'D')
                             ),
        data  = predictionsMean,
    )

    predictionsPercentilesTS = []
    for qLow, qHigh in predictionsPercentiles:

        predictionsLow  = pd.Series(
            index = pd.date_range(
                                    start = countryTSClean.index[0],
                                    end   = countryTSClean.index[-1] + pd.Timedelta(nDaysPredict, 'D')
                                 ),
            data  = qLow,
        )

        predictionsHigh = pd.Series(
            index = pd.date_range(
                                    start = countryTSClean.index[0],
                                    end   = countryTSClean.index[-1] + pd.Timedelta(nDaysPredict, 'D')
                                 ),
            data  = qHigh,
        )
        predictionsPercentilesTS.append([predictionsLow, predictionsHigh])

    return predictionsMeanTS, predictionsPercentilesTS

def predictLogisticGrowth(logGrowthModel: StanModel,
                          countryTrainIndex: int        = None,
                          countryName: str              = None,
                          confirmedCases                = None,
                          target                        = 'confirmed',
                          subGroup                      = 'casesGlobal',
                          nSamples                      = N_SAMPLES,
                          nChains                       = N_CHAINS,
                          nBurn                         = N_BURN,
                          nDaysPredict                  = N_DAYS_PREDICT,
                          minCasesFilter                = MIN_CASES_FILTER,
                          minNumberDaysWithCases        = MIN_NUMBER_DAYS_WITH_CASES,
                          predictionsPercentiles        = PREDICTIONS_PERCENTILES,
                          randomSeed                    = 2020,
                          **kwargs
                          ):
    """Predict the country with the nth highest number of cases

    Parameters
    ----------
    logGrowthModel: A compiled pystan model
    countryTrainIndex: Order countries from highest to lowest, and train the ith country
    countryName: Overwrites countryTrainIndex as the country to train
    confirmedCases: A dataframe of countries as columns, and total number of cases as a time series
        (see covidvu.vujson.parseCSSE)
    target: string in ['confirmed', 'deaths', 'recovered']
    subGroup: A key in the output of covidvu.pipeline.vujson.parseCSSE
    nSamples: Number of samples per chain of MCMC
    nChains: Number of independent chains MCMC
    nBurn: Number of initial iterations to discard for MCMC
    nDaysPredict: Number of days ahead to predict
    minCasesFilter: Minimum number of cases for prediction
    minNumberDaysWithCases: Minimum number of days with at least minCasesFilter
    predictionsPercentiles: Bayesian confidence intervals to evaluate
    randomSeed: Seed for stan sampler
    kwargs: Optional named arguments passed to covidvu.pipeline.vujson.parseCSSE

    Returns
    -------
    countryTS: All data for the queried country
    predictionsMeanTS: Posterior mean prediction
    predictionsPercentilesTS: Posterior percentiles
    trace: pymc3 trace object
    countryTSClean: Data used for training
    """

    if confirmedCases is None:
        confirmedCases = parseCSSE(target,
                                   siteData                      = kwargs.get('siteData', SITE_DATA),
                                   jhCSSEFileConfirmed           = kwargs.get('jhCSSEFileConfirmed',JH_CSSE_FILE_CONFIRMED),
                                   jhCSSEFileDeaths              = kwargs.get('jhCSSEFileDeaths',JH_CSSE_FILE_DEATHS),
                                   jhCSSEFileConfirmedDeprecated = kwargs.get('jhCSSEFileConfirmedDeprecated',
                                                                              JH_CSSE_FILE_CONFIRMED_DEPRECATED),
                                   jhCSSEFileDeathsDeprecated    = kwargs.get('jhCSSEFileDeathsDeprecated',
                                                                              JH_CSSE_FILE_DEATHS_DEPRECATED),
                                   jsCSSEReportPath              = kwargs.get('jsCSSEReportPath',JH_CSSE_REPORT_PATH),
                                   )[subGroup]

    if countryName is None:
        countryName = _getCountryToTrain(int(countryTrainIndex), confirmedCases)
    else:
        assert isinstance(countryName, str)

    countryTS = confirmedCases[countryName]
    countryTSClean = countryTS[countryTS > minCasesFilter]
    if countryTSClean.shape[0] < minNumberDaysWithCases:
        return None

    countryTSClean.index = pd.to_datetime(countryTSClean.index)

    t = np.arange(countryTSClean.shape[0])
    countryTSCleanLog = np.log(countryTSClean.values + 1)

    logisticGrowthData = {'nDays': countryTSClean.shape[0],
                          't': list(t),
                          'casesLog': list(countryTSCleanLog)
                          }
    fit = logGrowthModel.sampling(data=logisticGrowthData, iter=nSamples, chains=nChains, warmup=nBurn, seed=randomSeed)
    trace = fit.to_dataframe()

    predictionsMean, predictionsPercentilesTS =  _getPredictionsFromPosteriorSamples(t,
                                                                                     trace,
                                                                                     nDaysPredict,
                                                                                     predictionsPercentiles,
                                                                                     )

    predictionsMeanTS, predictionsPercentilesTS = _castPredictionsAsTS(countryTSClean,
                                                                       nDaysPredict,
                                                                       predictionsMean,
                                                                       predictionsPercentilesTS,
                                                                       )

    countryTS.index = pd.to_datetime(countryTS.index)
    prediction = {
                    'countryTS':                countryTS,
                    'predictionsMeanTS':        predictionsMeanTS,
                    'predictionsPercentilesTS': predictionsPercentilesTS,
                    'trace':                    trace,
                    'countryTSClean':           countryTSClean,
                    'countryName':              countryName,
                    't':                        t,
                 }

    return prediction


def _castDatetimeIndexToStr(timeSeries, dateCode = '%Y-%m-%d'):
    timeSeries.index = timeSeries.index.map(lambda s: s.strftime(dateCode))


def _dumpTimeSeriesAsJSON(timeSeries, target = None):
    assert isinstance(timeSeries.index, DatetimeIndex)
    _castDatetimeIndexToStr(timeSeries)
    result           = {
                            timeSeries.name: timeSeries.to_dict(),
                       }

    if target:
        dumpJSON(result, target)

    return result


def _dumpPredictionCollectionAsJSON(predictionsPercentilesTS,
                                    countryName,
                                    predictionsPercentiles,
                                    target,
                                    ):
    result = {}

    for i, (qLow, qHigh) in enumerate(predictionsPercentiles):
        tsLow = predictionsPercentilesTS[i][0]
        tsHigh = predictionsPercentilesTS[i][1]
        _castDatetimeIndexToStr(tsLow)
        _castDatetimeIndexToStr(tsHigh)

        result[qLow] = tsLow.to_dict()
        result[qHigh] = tsHigh.to_dict()
    result = {
        countryName: result
    }
    if target:
        dumpJSON(result, target)

    return result


def _dumpCountryPrediction(prediction, siteData, predictionsPercentiles):
    countryNameSimple = ''.join(e for e in prediction['countryName'] if e.isalnum())
    prediction['predictionsMeanTS'].name = prediction['countryName']

    _dumpTimeSeriesAsJSON(prediction['predictionsMeanTS'],
                          join(siteData, 'prediction-mean-%s.json' % countryNameSimple),
                          )

    _dumpPredictionCollectionAsJSON(prediction['predictionsPercentilesTS'],
                                    prediction['predictionsMeanTS'].name,
                                    predictionsPercentiles,
                                    join(siteData,
                                         'prediction-conf-int-%s.json' % countryNameSimple),
                                    )

def predictCountries(countryTrainIndex,
                     target                        = 'confirmed',
                     predictionsPercentiles        = PREDICTIONS_PERCENTILES,
                     siteData                      = SITE_DATA,
                     subGroup                      = 'casesGlobal',
                     jhCSSEFileConfirmed           = JH_CSSE_FILE_CONFIRMED,
                     jhCSSEFileDeaths              = JH_CSSE_FILE_DEATHS,
                     jhCSSEFileConfirmedDeprecated = JH_CSSE_FILE_CONFIRMED_DEPRECATED,
                     jhCSSEFileDeathsDeprecated    = JH_CSSE_FILE_DEATHS_DEPRECATED,
                     jsCSSEReportPath              = JH_CSSE_REPORT_PATH,
                     priorLogCarryingCapacity      = PRIOR_LOG_CARRYING_CAPACITY,
                     priorMidPoint                 = PRIOR_MID_POINT,
                     priorGrowthRate               = PRIOR_GROWTH_RATE,
                     priorSigma                    = PRIOR_SIGMA,
                     logRegModel                   = None,
                     **kwargs
                     ):
    """Generate forecasts for countries

    Parameters
    ----------
    countryTrainIndex: If an integer, trains the country ranked i+1 in order of total number of cases. If 'all',
        predicts all countries
    target: A string in ['confirmed', 'deaths', 'recovered']
    predictionsPercentiles: The posterior percentiles to compute
    siteData: The directory for output data
    subGroup:
    jhCSSEFileConfirmed:
    jhCSSEFileDeaths
    jhCSSEFileConfirmedDeprecated
    jhCSSEFileDeathsDeprecated
    jsCSSEReportPath
    priorLogCarryingCapacity
    priorMidPoint
    priorGrowthRate
    priorSigma
    logRegModel
    kwargs: Optional named arguments for covidvu.predictLogisticGrowth

    Returns
    -------
    JSON dump of mean prediction and confidence intervals
    """
    if logRegModel is None:
        print('Building model. This may take a few moments...')
        logRegModel = buildLogisticModel(priorLogCarryingCapacity= priorLogCarryingCapacity,
                                         priorMidPoint           = priorMidPoint,
                                         priorGrowthRate         = priorGrowthRate,
                                         priorSigma              = priorSigma,
                                         )
        print('Done.')
    else:
        assert isinstance(logRegModel, StanModel)

    if re.search(r'^\d+$', str(countryTrainIndex)):
        print(f'Training index {countryTrainIndex}')
        prediction = predictLogisticGrowth(logRegModel,
                                           countryTrainIndex             = countryTrainIndex,
                                           predictionsPercentiles        = predictionsPercentiles,
                                           target                        = target,
                                           siteData                      = siteData,
                                           jhCSSEFileConfirmed           = jhCSSEFileConfirmed,
                                           jhCSSEFileDeaths              = jhCSSEFileDeaths,
                                           jhCSSEFileConfirmedDeprecated = jhCSSEFileConfirmedDeprecated,
                                           jhCSSEFileDeathsDeprecated    = jhCSSEFileDeathsDeprecated,
                                           jsCSSEReportPath              = jsCSSEReportPath,
                                           **kwargs
                                           )

        _dumpCountryPrediction(prediction, siteData, predictionsPercentiles)
        print('Done.')

    elif countryTrainIndex == 'all':
        confirmedCases = parseCSSE(target,
                                   siteData                      = siteData,
                                   jhCSSEFileConfirmed           = jhCSSEFileConfirmed,
                                   jhCSSEFileDeaths              = jhCSSEFileDeaths,
                                   jhCSSEFileConfirmedDeprecated = jhCSSEFileConfirmedDeprecated,
                                   jhCSSEFileDeathsDeprecated    = jhCSSEFileDeathsDeprecated,
                                   jsCSSEReportPath              = jsCSSEReportPath,
                                   )[subGroup]
        countriesAll = confirmedCases.columns[confirmedCases.columns.map(lambda c: c[0]!='!')]
        for countryName in countriesAll:
            print(f'Training {countryName}...')

            prediction = predictLogisticGrowth(logRegModel,
                                               countryName                   = countryName,
                                               confirmedCases                = confirmedCases,
                                               predictionsPercentiles        = predictionsPercentiles,
                                               target                        = target,
                                               siteData                      = siteData,
                                               jhCSSEFileConfirmed           = jhCSSEFileConfirmed,
                                               jhCSSEFileDeaths              = jhCSSEFileDeaths,
                                               jhCSSEFileConfirmedDeprecated = jhCSSEFileConfirmedDeprecated,
                                               jhCSSEFileDeathsDeprecated    = jhCSSEFileDeathsDeprecated,
                                               jsCSSEReportPath              = jsCSSEReportPath,
                                               **kwargs,
                                               )
            if prediction:
                _dumpCountryPrediction(prediction, siteData, predictionsPercentiles)
                print('Saved.')
            else:
                print('Skipped.')
        print('Done.')
    else:
        raise NotImplementedError


def getSavedShortCountryNames(siteData = SITE_DATA):
    countryNameShortAll = []
    for filename in os.listdir(siteData):
        match = re.search(r'^prediction-conf-int-(.*\w).json', filename)
        if match:
            countryNameShort = match.groups()[0]
            countryNameShortAll.append(countryNameShort)
    return countryNameShortAll

def load(countryIndex: int, siteData=SITE_DATA):
    assert isinstance(countryIndex, int)

    countryNameShortAll = getSavedShortCountryNames(siteData=siteData)

    assert abs(countryIndex) < len(countryNameShortAll)

    with open(join(siteData, 'prediction-conf-int-%s.json' % countryNameShortAll[countryIndex])) as jsonFile:
        confidenceIntervals = json.load(jsonFile)

    with open(join(siteData, 'prediction-mean-%s.json' % countryNameShortAll[countryIndex])) as jsonFile:
        meanPrediction = json.load(jsonFile)

    meanPredictionTS = pd.Series(list(meanPrediction.values())[0])
    meanPredictionTS.index = pd.to_datetime(meanPredictionTS.index)

    percentilesTS = pd.DataFrame(list(confidenceIntervals.values())[0])
    percentilesTS.index = pd.to_datetime(percentilesTS.index)

    countryName = list(meanPrediction.keys())[0]

    return meanPredictionTS, percentilesTS, countryName


def loadAll(target='confirmed', subGroup='casesGlobal', **kwargs):
    confirmedCasesAll = parseCSSE(target, **kwargs)[subGroup]
    nTrainedCountries = len(getSavedShortCountryNames(siteData = kwargs.get('siteData', SITE_DATA)))
    meanPredictionTSAll = pd.DataFrame()
    percentilesTSAll = pd.DataFrame()
    for i in range(nTrainedCountries):
        meanPredictionTS, percentilesTS, countryName = load(i, siteData=kwargs.get('siteData', SITE_DATA))
        meanPredictionTS.name = 'meanPrediction'
        meanPredictionTS = meanPredictionTS.to_frame()
        meanPredictionTS['countryName'] = countryName
        percentilesTS['countryName'] = countryName
        percentilesTSAll = percentilesTSAll.append(percentilesTS)
        meanPredictionTSAll = meanPredictionTSAll.append(meanPredictionTS)
    percentilesTSAll = percentilesTSAll.pivot(columns='countryName')
    meanPredictionTSAll = meanPredictionTSAll.pivot(columns='countryName')
    meanPredictionTSAll.columns = meanPredictionTSAll.columns.droplevel(level=0)
    return confirmedCasesAll, meanPredictionTSAll, percentilesTSAll


if '__main__' == __name__:
    for argument in sys.argv[1:]:
        predictCountries(argument)

