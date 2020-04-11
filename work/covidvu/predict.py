#!/usr/bin/env python3
# See: https://github.com/VirusTrack/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


from os.path import join

from pandas.core.indexes.datetimes import DatetimeIndex

from covidvu.pipeline.vujson import SITE_DATA
from covidvu.pipeline.vujson import dumpJSON
from covidvu.cryostation import Cryostation

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

DATABASE_PATH = 'database/virustrack.db'


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


def predictLogisticGrowth(logGrowthModel: StanModel,
                          regionName,
                          target                 = 'confirmed',
                          regionType             = 'country',
                          nSamples               = N_SAMPLES,
                          nChains                = N_CHAINS,
                          nDaysPredict           = N_DAYS_PREDICT,
                          minCasesFilter         = MIN_CASES_FILTER,
                          minNumberDaysWithCases = MIN_NUMBER_DAYS_WITH_CASES,
                          predictionsPercentiles = PREDICTIONS_PERCENTILES,
                          randomSeed             = 2020,
                          databasePath           = DATABASE_PATH,
                          maxTreeDepth           = MAX_TREEDEPTH,
                          ):
    """Predict the region with the nth highest number of cases

    Parameters
    ----------
    logGrowthModel: A compiled pystan model
    regionName: Name of the region to train, which must be a country or US state in Cryostation
    target: 'confirmed' or 'deaths'
    regionType: 'country' or 'stateUS
    nSamples: Number of samples per chain of MCMC
    nChains: Number of independent chains MCMC
    nDaysPredict: Number of days ahead to predict
    minCasesFilter: Minimum number of cases for prediction
    minNumberDaysWithCases: Minimum number of days with at least minCasesFilter
    predictionsPercentiles: Bayesian confidence intervals to evaluate
    randomSeed: Seed for stan sampler
    databasePath: Path to virustrack.db
    maxTreeDepth: max_treedepth for pystan

    Returns
    -------
    regionTS: All data for the queried region
    predictionsMeanTS: Posterior mean prediction
    predictionsPercentilesTS: Posterior percentiles
    trace: pymc3 trace object
    regionTSClean: Data used for training
    """

    with Cryostation(databasePath) as storage:
        try:
            if regionType == 'country':
                if target in storage[regionName].keys():
                    regionTS = pd.Series(storage[regionName][target])
                else:
                    return None
            elif regionType == 'stateUS':
                if target in storage['US']['provinces'][regionName].keys():
                    regionTS = pd.Series(storage['US']['provinces'][regionName][target])
                else:
                    return None
            else:
                raise NotImplementedError
        except Exception as e:
            raise e

    regionTS.index = pd.to_datetime(regionTS.index)

    minIndex = (regionTS > minCasesFilter).argmax()
    regionTSClean = regionTS.iloc[minIndex:]
    if regionTSClean.shape[0] < minNumberDaysWithCases:
        return None

    regionTSClean.index = pd.to_datetime(regionTSClean.index)

    t = np.arange(regionTSClean.shape[0])
    regionTSCleanLog = np.log(regionTSClean.values + 1)

    logisticGrowthData = {'nDays': regionTSClean.shape[0],
                          't': list(t),
                          'casesLog': list(regionTSCleanLog)
                          }


    fit = logGrowthModel.sampling(data=logisticGrowthData, iter=nSamples, chains=nChains, seed=randomSeed,
                                  control={'max_treedepth':maxTreeDepth}
                                  )

    trace = fit.to_dataframe()

    predictionsMean, predictionsPercentilesTS =  _getPredictionsFromPosteriorSamples(t,
                                                                                     trace,
                                                                                     nDaysPredict,
                                                                                     predictionsPercentiles,
                                                                                     )

    predictionsMeanTS, predictionsPercentilesTS = _castPredictionsAsTS(regionTSClean,
                                                                       nDaysPredict,
                                                                       predictionsMean,
                                                                       predictionsPercentilesTS,
                                                                       )

    regionTS.index = pd.to_datetime(regionTS.index)
    prediction = {
        'regionTS':                 regionTS,
        'predictionsMeanTS':        predictionsMeanTS,
        'predictionsPercentilesTS': predictionsPercentilesTS,
        'trace':                    trace,
        'regionTSClean':            regionTSClean,
        'regionName':               regionName,
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
    if prediction is None:
        return
    else:
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





def predictRegions(regionName,
                   regionType='country',
                   target='confirmed',
                   predictionsPercentiles=PREDICTIONS_PERCENTILES,
                   siteData=SITE_DATA,
                   priorLogCarryingCapacity=PRIOR_LOG_CARRYING_CAPACITY,
                   priorMidPoint=PRIOR_MID_POINT,
                   priorGrowthRate=PRIOR_GROWTH_RATE,
                   priorSigma=PRIOR_SIGMA,
                   logGrowthModel=None,
                   databasePath=DATABASE_PATH,
                   nLimitRegions=None,
                   **kwargs
                   ):
    """Generate forecasts for regions

    Parameters
    ----------
    regionName: A country key of Cryostation, or 'all'
    target: 'confirmed' or 'deaths'
    predictionsPercentiles: The posterior percentiles to compute
    siteData: The directory for output data
    regionType: 'country' or 'stateUS'
    priorLogCarryingCapacity
    priorMidPoint
    priorGrowthRate
    priorSigma
    logGrowthModel: A compiled pystan model
    databasePath: Path to virustrack.db
    nLimitRegions: Maximum number of regions to train in alphabetical order
    kwargs: Optional named arguments for covidvu.predictLogisticGrowth

    Returns
    -------
    JSON dump of mean prediction and confidence intervals
    """
    if logGrowthModel is None:
        print('Building model. This may take a few moments...')
        logGrowthModel = buildLogisticModel(priorLogCarryingCapacity= priorLogCarryingCapacity,
                                            priorMidPoint=priorMidPoint,
                                            priorGrowthRate=priorGrowthRate,
                                            priorSigma=priorSigma,
                                            )
        print('Done.')
    else:
        assert isinstance(logGrowthModel, StanModel)

    if regionName == 'all':
        if regionType == 'country':
            with Cryostation(databasePath) as cs:
                countries = cs.allCountryNames()
            for i, country in enumerate(countries):
                print(f'Training {country}')
                if nLimitRegions:
                    if i > nLimitRegions-1:
                        break

                prediction = predictLogisticGrowth(logGrowthModel,
                                                   country,
                                                   regionType=regionType,
                                                   predictionsPercentiles=predictionsPercentiles,
                                                   target=target,
                                                   **kwargs
                                                   )
                _dumpRegionPrediction(prediction, siteData, predictionsPercentiles,
                                      meanFilename=PREDICTION_MEAN_JSON_FILENAME_WORLD,
                                      confIntFilename=PREDICTION_CI_JSON_FILENAME_WORLD, )
                print('Done.')
        elif regionType == 'stateUS':
            with Cryostation(databasePath) as cs:
                statesUS = cs.allProvincesOf('US')
            for i, state in enumerate(statesUS):
                if nLimitRegions:
                    if i > nLimitRegions:
                        break
                print(f'Training {state}')
                prediction = predictLogisticGrowth(logGrowthModel,
                                                   state,
                                                   regionType=regionType,
                                                   predictionsPercentiles=predictionsPercentiles,
                                                   target=target,
                                                   **kwargs
                                                   )
                _dumpRegionPrediction(prediction, siteData, predictionsPercentiles,
                                      meanFilename=PREDICTION_MEAN_JSON_FILENAME_US,
                                      confIntFilename=PREDICTION_CI_JSON_FILENAME_US, )
                print('Done.')
        else:
            raise ValueError(f'regionType = {regionType} not understood')
    else:
        print(f'Training {regionName}')
        prediction = predictLogisticGrowth(logGrowthModel,
                                           regionName,
                                           regionType=regionType,
                                           predictionsPercentiles=predictionsPercentiles,
                                           target=target,
                                           **kwargs,
                                           )
        if regionType == 'country':
            _dumpRegionPrediction(prediction, siteData, predictionsPercentiles,
                                  meanFilename=PREDICTION_MEAN_JSON_FILENAME_WORLD,
                                  confIntFilename=PREDICTION_CI_JSON_FILENAME_WORLD, )
        elif regionType == 'stateUS':
            _dumpRegionPrediction(prediction, siteData, predictionsPercentiles,
                                  meanFilename=PREDICTION_MEAN_JSON_FILENAME_US,
                                  confIntFilename=PREDICTION_CI_JSON_FILENAME_US, )

    print('Done.')


def getSavedPredictionRegionNames(siteData = SITE_DATA,
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
        regionNameShortAll = getSavedPredictionRegionNames(siteData=siteData)
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


def loadAll(confIntFilename=PREDICTION_CI_JSON_FILENAME_WORLD, siteData=SITE_DATA,):
    trainedRegions = getSavedPredictionRegionNames(siteData = siteData,
                                               confIntFilename = confIntFilename,
                                               )
    assert len(trainedRegions) > 0
    meanPredictionTSAll = pd.DataFrame()
    percentilesTSAll = pd.DataFrame()
    for regionNameShort in trainedRegions:
        meanPredictionTS, percentilesTS, regionName = load(regionNameShort=regionNameShort,
                                                            siteData=siteData,
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
    return meanPredictionTSAll, percentilesTSAll


if '__main__' == __name__:
    for argument in sys.argv[1:]:
        logGrowthModel = buildLogisticModel()
        print('Training all countries...')
        predictRegions(argument, logGrowthModel=logGrowthModel, regionType='country')

        print('Training all US States...')
        predictRegions(argument, logGrowthModel=logGrowthModel, regionType='stateUS')

