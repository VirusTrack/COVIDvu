#!/bin/bash

# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


from os.path import join

from pandas.core.indexes.datetimes import DatetimeIndex

from covidvu.pipeline.vujson import JH_CSSE_FILE_CONFIRMED
# TODO: Juvid - https://github.com/VirusTrack/COVIDvu/issues/445
# from covidvu.pipeline.vujson import JH_CSSE_FILE_CONFIRMED_DEPRECATED
from covidvu.pipeline.vujson import JH_CSSE_FILE_DEATHS
# TODO: Juvid - https://github.com/VirusTrack/COVIDvu/issues/445
# from covidvu.pipeline.vujson import JH_CSSE_FILE_DEATHS_DEPRECATED
# from covidvu.pipeline.vujson import JH_CSSE_REPORT_PATH
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
N_CHAINS         = 3
N_DAYS_PREDICT   = 14
MIN_CASES_FILTER = 50
MIN_NUMBER_DAYS_WITH_CASES = 10
MAX_TREEDEPTH = 12

PRIOR_LOG_CARRYING_CAPACITY = (0, 10)
PRIOR_MID_POINT             = (0, 1000)
PRIOR_GROWTH_RATE           = (0.5, 0.5)
PRIOR_SIGMA                 = (0, 10)

PREDICTIONS_PERCENTILES = (
                                (2.5, 97.5),
                                (25, 75),
                          )

PREDICTION_MEAN_JSON_FILENAME_WORLD = 'prediction-world-mean-%s.json'
PREDICTION_CI_JSON_FILENAME_WORLD   = 'prediction-world-conf-int-%s.json'
PREDICTION_MEAN_JSON_FILENAME_US    = 'prediction-US-mean-%s.json'
PREDICTION_CI_JSON_FILENAME_US      = 'prediction-US-conf-int-%s.json'

def _getCountryToTrain(regionTrainIndex, confirmedCases):
    topCountries = confirmedCases.iloc[-1, confirmedCases.columns.map(lambda c: c[0] != '!')]
    topCountries = topCountries.sort_values(ascending=False)
    regionName = topCountries.index[regionTrainIndex]
    return regionName


def buildLogisticModel(priorLogCarryingCapacity = PRIOR_LOG_CARRYING_CAPACITY,
                       priorMidPoint = PRIOR_MID_POINT,
                       priorGrowthRate = PRIOR_GROWTH_RATE,
                       priorSigma = PRIOR_SIGMA,
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
      logCarryingCapacity ~ uniform({priorLogCarryingCapacity[0]},{priorLogCarryingCapacity[1]});
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


def _castPredictionsAsTS(regionTSClean,
                         nDaysPredict,
                         predictionsMean,
                         predictionsPercentiles,
                         ):
    predictionsMeanTS = pd.Series(
        index = pd.date_range(
                                start = regionTSClean.index[0],
                                end   = regionTSClean.index[-1] + pd.Timedelta(nDaysPredict, 'D')
                             ),
        data  = predictionsMean,
    )

    predictionsPercentilesTS = []
    for qLow, qHigh in predictionsPercentiles:

        predictionsLow  = pd.Series(
            index = pd.date_range(
                                    start = regionTSClean.index[0],
                                    end   = regionTSClean.index[-1] + pd.Timedelta(nDaysPredict, 'D')
                                 ),
            data  = qLow,
        )

        predictionsHigh = pd.Series(
            index = pd.date_range(
                                    start = regionTSClean.index[0],
                                    end   = regionTSClean.index[-1] + pd.Timedelta(nDaysPredict, 'D')
                                 ),
            data  = qHigh,
        )
        predictionsPercentilesTS.append([predictionsLow, predictionsHigh])

    return predictionsMeanTS, predictionsPercentilesTS


# TODO: Juvid - https://github.com/VirusTrack/COVIDvu/issues/445
# def predictLogisticGrowth(logGrowthModel: StanModel,
#                           regionTrainIndex: int        = None,
#                           regionName: str              = None,
#                           confirmedCases                = None,
#                           target                        = 'confirmed',
#                           subGroup                      = 'casesGlobal',
#                           nSamples                      = N_SAMPLES,
#                           nChains                       = N_CHAINS,
#                           nDaysPredict                  = N_DAYS_PREDICT,
#                           minCasesFilter                = MIN_CASES_FILTER,
#                           minNumberDaysWithCases        = MIN_NUMBER_DAYS_WITH_CASES,
#                           predictionsPercentiles        = PREDICTIONS_PERCENTILES,
#                           randomSeed                    = 2020,
#                           **kwargs
#                           ):
#     """Predict the region with the nth highest number of cases
# 
#     Parameters
#     ----------
#     logGrowthModel: A compiled pystan model
#     regionTrainIndex: Order countries from highest to lowest, and train the ith region
#     regionName: Overwrites regionTrainIndex as the region to train
#     confirmedCases: A dataframe of countries as columns, and total number of cases as a time series
#         (see covidvu.vujson.parseCSSE)
#     target: string in ['confirmed', 'deaths', 'recovered']
#     subGroup: A key in the output of covidvu.pipeline.vujson.parseCSSE
#     nSamples: Number of samples per chain of MCMC
#     nChains: Number of independent chains MCMC
#     nDaysPredict: Number of days ahead to predict
#     minCasesFilter: Minimum number of cases for prediction
#     minNumberDaysWithCases: Minimum number of days with at least minCasesFilter
#     predictionsPercentiles: Bayesian confidence intervals to evaluate
#     randomSeed: Seed for stan sampler
#     kwargs: Optional named arguments passed to covidvu.pipeline.vujson.parseCSSE
# 
#     Returns
#     -------
#     regionTS: All data for the queried region
#     predictionsMeanTS: Posterior mean prediction
#     predictionsPercentilesTS: Posterior percentiles
#     trace: pymc3 trace object
#     regionTSClean: Data used for training
#     """
#     maxTreeDepth = kwargs.get('maxTreedepth', MAX_TREEDEPTH)
# 
#     if confirmedCases is None:
#         confirmedCases = parseCSSE(target,
#                                    siteData                      = kwargs.get('siteData', SITE_DATA),
#                                    jhCSSEFileConfirmed           = kwargs.get('jhCSSEFileConfirmed',JH_CSSE_FILE_CONFIRMED),
#                                    jhCSSEFileDeaths              = kwargs.get('jhCSSEFileDeaths',JH_CSSE_FILE_DEATHS),
#                                    jhCSSEFileConfirmedDeprecated = kwargs.get('jhCSSEFileConfirmedDeprecated',
#                                                                               JH_CSSE_FILE_CONFIRMED_DEPRECATED),
#                                    jhCSSEFileDeathsDeprecated    = kwargs.get('jhCSSEFileDeathsDeprecated',
#                                                                               JH_CSSE_FILE_DEATHS_DEPRECATED),
#                                    jsCSSEReportPath              = kwargs.get('jsCSSEReportPath',JH_CSSE_REPORT_PATH),
#                                    )[subGroup]
# 
#     if regionName is None:
#         regionName = _getCountryToTrain(int(regionTrainIndex), confirmedCases)
#     else:
#         assert isinstance(regionName, str)
# 
#     regionTS = confirmedCases[regionName]
#     regionTSClean = regionTS[regionTS > minCasesFilter]
#     if regionTSClean.shape[0] < minNumberDaysWithCases:
#         return None
# 
#     regionTSClean.index = pd.to_datetime(regionTSClean.index)
# 
#     t = np.arange(regionTSClean.shape[0])
#     regionTSCleanLog = np.log(regionTSClean.values + 1)
# 
#     logisticGrowthData = {'nDays': regionTSClean.shape[0],
#                           't': list(t),
#                           'casesLog': list(regionTSCleanLog)
#                           }
# 
# 
#     fit = logGrowthModel.sampling(data=logisticGrowthData, iter=nSamples, chains=nChains, seed=randomSeed,
#                                   control={'max_treedepth':maxTreeDepth}
#                                   )
# 
#     trace = fit.to_dataframe()
# 
#     predictionsMean, predictionsPercentilesTS =  _getPredictionsFromPosteriorSamples(t,
#                                                                                      trace,
#                                                                                      nDaysPredict,
#                                                                                      predictionsPercentiles,
#                                                                                      )
# 
#     predictionsMeanTS, predictionsPercentilesTS = _castPredictionsAsTS(regionTSClean,
#                                                                        nDaysPredict,
#                                                                        predictionsMean,
#                                                                        predictionsPercentilesTS,
#                                                                        )
# 
#     regionTS.index = pd.to_datetime(regionTS.index)
#     prediction = {
#                     'regionTS':                 regionTS,
#                     'predictionsMeanTS':        predictionsMeanTS,
#                     'predictionsPercentilesTS': predictionsPercentilesTS,
#                     'trace':                    trace,
#                     'regionTSClean':            regionTSClean,
#                     'regionName':               regionName,
#                     't':                        t,
#                  }
# 
#     return prediction


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
                                    regionName,
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
        regionName: result
    }
    if target:
        dumpJSON(result, target)

    return result


def _dumpRegionPrediction(prediction, siteData, predictionsPercentiles,
                           meanFilename=PREDICTION_MEAN_JSON_FILENAME_WORLD,
                           confIntFilename=PREDICTION_CI_JSON_FILENAME_WORLD,
                           ):
    regionNameSimple = ''.join(e for e in prediction['regionName'] if e.isalnum())
    prediction['predictionsMeanTS'].name = prediction['regionName']

    _dumpTimeSeriesAsJSON(prediction['predictionsMeanTS'],
                          join(siteData, meanFilename % regionNameSimple),
                          )

    _dumpPredictionCollectionAsJSON(prediction['predictionsPercentilesTS'],
                                    prediction['predictionsMeanTS'].name,
                                    predictionsPercentiles,
                                    join(siteData,
                                         confIntFilename % regionNameSimple),
                                    )


def castPercentilesAsDF(predictionsPercentilesTS, predictionsPercentiles):
    percentiles = pd.DataFrame()
    predictionsPercentilesTS = predictionsPercentilesTS
    for i, (qLow, qHigh) in enumerate(predictionsPercentiles):
        tsLow = predictionsPercentilesTS[i][0]
        tsHigh = predictionsPercentilesTS[i][1]

        percentiles[str(qLow)] = tsLow
        percentiles[str(qHigh)] = tsHigh
    return percentiles


# TODO: Juvid - https://github.com/VirusTrack/COVIDvu/issues/445
# def predictRegions(regionTrainIndex,
#                      target                        = 'confirmed',
#                      predictionsPercentiles        = PREDICTIONS_PERCENTILES,
#                      siteData                      = SITE_DATA,
#                      subGroup                      = 'casesGlobal',
#                      jhCSSEFileConfirmed           = JH_CSSE_FILE_CONFIRMED,
#                      jhCSSEFileDeaths              = JH_CSSE_FILE_DEATHS,
#                      jhCSSEFileConfirmedDeprecated = JH_CSSE_FILE_CONFIRMED_DEPRECATED,
#                      jhCSSEFileDeathsDeprecated    = JH_CSSE_FILE_DEATHS_DEPRECATED,
#                      jsCSSEReportPath              = JH_CSSE_REPORT_PATH,
#                      priorLogCarryingCapacity      = PRIOR_LOG_CARRYING_CAPACITY,
#                      priorMidPoint                 = PRIOR_MID_POINT,
#                      priorGrowthRate               = PRIOR_GROWTH_RATE,
#                      priorSigma                    = PRIOR_SIGMA,
#                      logGrowthModel                   = None,
#                      **kwargs
#                      ):
#     """Generate forecasts for regions
# 
#     Parameters
#     ----------
#     regionTrainIndex: If an integer, trains the region ranked i+1 in order of total number of cases. If 'all',
#         predicts all regions
#     target: A string in ['confirmed', 'deaths', 'recovered']
#     predictionsPercentiles: The posterior percentiles to compute
#     siteData: The directory for output data
#     subGroup:
#     jhCSSEFileConfirmed:
#     jhCSSEFileDeaths
#     jhCSSEFileConfirmedDeprecated
#     jhCSSEFileDeathsDeprecated
#     jsCSSEReportPath
#     priorLogCarryingCapacity
#     priorMidPoint
#     priorGrowthRate
#     priorSigma
#     logGrowthModel
#     kwargs: Optional named arguments for covidvu.predictLogisticGrowth
# 
#     Returns
#     -------
#     JSON dump of mean prediction and confidence intervals
#     """
#     if logGrowthModel is None:
#         print('Building model. This may take a few moments...')
#         logGrowthModel = buildLogisticModel(priorLogCarryingCapacity= priorLogCarryingCapacity,
#                                          priorMidPoint           = priorMidPoint,
#                                          priorGrowthRate         = priorGrowthRate,
#                                          priorSigma              = priorSigma,
#                                          )
#         print('Done.')
#     else:
#         assert isinstance(logGrowthModel, StanModel)
# 
#     if re.search(r'^\d+$', str(regionTrainIndex)):
#         print(f'Training index {regionTrainIndex}')
#         prediction = predictLogisticGrowth(logGrowthModel,
#                                            regionTrainIndex              = regionTrainIndex,
#                                            predictionsPercentiles        = predictionsPercentiles,
#                                            target                        = target,
#                                            siteData                      = siteData,
#                                            jhCSSEFileConfirmed           = jhCSSEFileConfirmed,
#                                            jhCSSEFileDeaths              = jhCSSEFileDeaths,
#                                            jhCSSEFileConfirmedDeprecated = jhCSSEFileConfirmedDeprecated,
#                                            jhCSSEFileDeathsDeprecated    = jhCSSEFileDeathsDeprecated,
#                                            jsCSSEReportPath              = jsCSSEReportPath,
#                                            **kwargs
#                                            )
#         if subGroup == 'casesGlobal':
#             _dumpRegionPrediction(prediction, siteData, predictionsPercentiles)
#         elif subGroup == 'casesUSStates':
#             _dumpRegionPrediction(prediction, siteData, predictionsPercentiles,
#                                   meanFilename=PREDICTION_MEAN_JSON_FILENAME_US,
#                                   confIntFilename=PREDICTION_CI_JSON_FILENAME_US,)
#         else:
#             raise NotImplementedError
# 
#         print('Done.')
# 
#     elif regionTrainIndex == 'all':
#         confirmedCases = parseCSSE(target,
#                                    siteData                      = siteData,
#                                    jhCSSEFileConfirmed           = jhCSSEFileConfirmed,
#                                    jhCSSEFileDeaths              = jhCSSEFileDeaths,
#                                    jhCSSEFileConfirmedDeprecated = jhCSSEFileConfirmedDeprecated,
#                                    jhCSSEFileDeathsDeprecated    = jhCSSEFileDeathsDeprecated,
#                                    jsCSSEReportPath              = jsCSSEReportPath,
#                                    )[subGroup]
#         regionsAll = confirmedCases.columns[confirmedCases.columns.map(lambda c: c[0]!='!')]
#         for regionName in regionsAll:
#             print(f'Training {regionName}...')
# 
#             prediction = predictLogisticGrowth(logGrowthModel,
#                                                regionName                    = regionName,
#                                                confirmedCases                = confirmedCases,
#                                                predictionsPercentiles        = predictionsPercentiles,
#                                                target                        = target,
#                                                siteData                      = siteData,
#                                                jhCSSEFileConfirmed           = jhCSSEFileConfirmed,
#                                                jhCSSEFileDeaths              = jhCSSEFileDeaths,
#                                                jhCSSEFileConfirmedDeprecated = jhCSSEFileConfirmedDeprecated,
#                                                jhCSSEFileDeathsDeprecated    = jhCSSEFileDeathsDeprecated,
#                                                jsCSSEReportPath              = jsCSSEReportPath,
#                                                **kwargs,
#                                                )
#             if prediction:
#                 if subGroup == 'casesGlobal':
#                     _dumpRegionPrediction(prediction, siteData, predictionsPercentiles)
#                 elif subGroup == 'casesUSStates':
#                     _dumpRegionPrediction(prediction, siteData, predictionsPercentiles,
#                                           meanFilename=PREDICTION_MEAN_JSON_FILENAME_US,
#                                           confIntFilename=PREDICTION_CI_JSON_FILENAME_US, )
#                 else:
#                     raise NotImplementedError
#                 print('Saved.')
#             else:
#                 print('Skipped.')
#         print('Done.')
#     else:
#         raise NotImplementedError


def getSavedShortCountryNames(siteData = SITE_DATA,
                              confIntFilename=PREDICTION_CI_JSON_FILENAME_WORLD,
                              ):
    regionNameShortAll = []
    pattern = '^' + confIntFilename.replace('%s', '(.*\w)')
    for filename in os.listdir(siteData):
        match = re.search(pattern, filename)
        if match:
            regionNameShort = match.groups()[0]
            regionNameShortAll.append(regionNameShort)
    return regionNameShortAll


def load(regionIndex = None,
         regionNameShort = None,
         siteData=SITE_DATA,
         meanFilename=PREDICTION_MEAN_JSON_FILENAME_WORLD,
         confIntFilename=PREDICTION_CI_JSON_FILENAME_WORLD,):

    if regionNameShort is None:
        assert isinstance(regionIndex, int)
        regionNameShortAll = getSavedShortCountryNames(siteData=siteData)
        regionNameShort = regionNameShortAll[regionIndex]
        assert abs(regionIndex) < len(regionNameShortAll)
    else:
        assert isinstance(regionNameShort, str)

    with open(join(siteData, confIntFilename % regionNameShort)) as jsonFile:
        confidenceIntervals = json.load(jsonFile)

    with open(join(siteData, meanFilename % regionNameShort)) as jsonFile:
        meanPrediction = json.load(jsonFile)

    meanPredictionTS = pd.Series(list(meanPrediction.values())[0])
    meanPredictionTS.index = pd.to_datetime(meanPredictionTS.index)

    percentilesTS = pd.DataFrame(list(confidenceIntervals.values())[0])
    percentilesTS.index = pd.to_datetime(percentilesTS.index)

    regionName = list(meanPrediction.keys())[0]

    return meanPredictionTS, percentilesTS, regionName


def loadAll(target='confirmed', subGroup='casesGlobal', confIntFilename=PREDICTION_CI_JSON_FILENAME_WORLD, **kwargs):
    confirmedCasesAll = parseCSSE(target, **kwargs)[subGroup]
    nTrainedRegions = len(getSavedShortCountryNames(siteData = kwargs.get('siteData', SITE_DATA),
                                                      confIntFilename = confIntFilename,
                                                      ))
    assert nTrainedRegions > 0
    meanPredictionTSAll = pd.DataFrame()
    percentilesTSAll = pd.DataFrame()
    for i in range(nTrainedRegions):
        meanPredictionTS, percentilesTS, regionName = load(i,
                                                            siteData=kwargs.get('siteData', SITE_DATA),
                                                            confIntFilename=confIntFilename,
                                                            )
        meanPredictionTS.name = 'meanPrediction'
        meanPredictionTS = meanPredictionTS.to_frame()
        meanPredictionTS['regionName'] = regionName
        percentilesTS['regionName'] = regionName
        percentilesTSAll = percentilesTSAll.append(percentilesTS)
        meanPredictionTSAll = meanPredictionTSAll.append(meanPredictionTS)
    percentilesTSAll = percentilesTSAll.pivot(columns='regionName')
    meanPredictionTSAll = meanPredictionTSAll.pivot(columns='regionName')
    meanPredictionTSAll.columns = meanPredictionTSAll.columns.droplevel(level=0)
    return confirmedCasesAll, meanPredictionTSAll, percentilesTSAll


if '__main__' == __name__:
    for argument in sys.argv[1:]:
        logGrowthModel = buildLogisticModel()
        predictRegions(argument, logGrowthModel=logGrowthModel)
        predictRegions(argument, logGrowthModel=logGrowthModel, subGroup='casesUSStates')

