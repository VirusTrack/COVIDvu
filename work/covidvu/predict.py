import sys
import numpy as np
import pandas as pd
from pandas.core.indexes.datetimes import DatetimeIndex
import pymc3 as pm

import covidvu.pipeline.vujson as vujson
from covidvu.pipeline.vujson import _dumpJSON

N_SAMPLES        = 500
N_TUNE           = 100
N_CHAINS         = 1
N_DAYS_PREDICT   = 14
MIN_CASES_FILTER = 10

PRIOR_LOG_CARRYING_CAPACITY = (3, 10)
PRIOR_MID_POINT             = (0, 1e3)
PRIOR_GROWTH_RATE           = (0, 1)
PRIOR_SIGMA                 = (0, 10)

PREDICTIONS_PERCENTILES = (
                                (2.5, 97.5),
                                (25, 75),
                          )

from pdb import set_trace


def _getCountryToTrain(countryTrainIndex, confirmedCases):
    topCountries = confirmedCases.iloc[-1, confirmedCases.columns.map(lambda c: c[0] != '!')]
    topCountries = topCountries.sort_values(ascending=False)
    countryName = topCountries.index[countryTrainIndex]
    return countryName


def _initializeLogisticModel(t,
                             dataLog,
                             priorLogCarryingCapacity,
                             priorMidPoint,
                             priorGrowthRate,
                             priorSigma,
                             ):
    logRegModel = pm.Model()
    with logRegModel:
        # Priors
        logCarryingCapacity = pm.Uniform(name  = 'logCarryingCapacity',
                                         lower = priorLogCarryingCapacity[0],
                                         upper =priorLogCarryingCapacity[1],
                                         )

        midPoint = pm.Uniform(name = 'midPoint',
                              lower = priorMidPoint[0],
                              upper = priorMidPoint[1],
                              )

        growthRate = pm.Uniform(name  = 'growthRate',
                                lower = priorGrowthRate[0],
                                upper = priorGrowthRate[1],
                                )

        sigma = pm.Uniform(name  = 'sigma',
                           lower = priorSigma[0],
                           upper = priorSigma[1],
                           )

        # Mean
        carryingCap = 10 ** logCarryingCapacity
        casesLin = carryingCap / (1 + np.exp(-1.0 * growthRate * (t - midPoint)))
        casesLog = np.log(casesLin + 1)

        # Likelihood
        _ = pm.Normal(name     = 'casesObsLog',
                      mu       = casesLog,
                      sigma    = sigma,
                      observed = dataLog,
                      )
    return logRegModel


def _getPredictionsFromPosteriorSamples(t,
                                        trace,
                                        nDaysPredict,
                                        nSamples,
                                        predictionsPercentiles,
                                        ):
    tStartPredict = t[-1] + 1
    tPredict = np.arange(tStartPredict, tStartPredict + nDaysPredict)

    predictions = np.zeros((nDaysPredict, nSamples))

    for i in range(nSamples):
        carryingCap = 10 ** trace['logCarryingCapacity'][i]

        predictions[:, i] = carryingCap / (
                1 + np.exp(-1.0 * trace['growthRate'][i] * (tPredict - trace['midPoint'][i])))

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
                                start = countryTSClean.index[-1] + pd.Timedelta(1, 'D'),
                                end   = countryTSClean.index[-1] + pd.Timedelta(nDaysPredict, 'D')
                             ),
        data  = predictionsMean,
    )

    predictionsPercentilesTS = []
    for qLow, qHigh in predictionsPercentiles:

        predictionsLow  = pd.Series(
            index = pd.date_range(
                                    start = countryTSClean.index[-1] + pd.Timedelta(1, 'D'),
                                    end   = countryTSClean.index[-1] + pd.Timedelta(nDaysPredict, 'D')
                                 ),
            data=qLow,
        )

        predictionsHigh = pd.Series(
            index = pd.date_range(
                                    start = countryTSClean.index[-1] + pd.Timedelta(1, 'D'),
                                    end   = countryTSClean.index[-1] + pd.Timedelta(nDaysPredict, 'D')
                                 ),
            data=qHigh,
        )
        predictionsPercentilesTS.append([predictionsLow, predictionsHigh])

    return predictionsMeanTS, predictionsPercentilesTS

def predictLogisticGrowth(countryTrainIndex: int        = None,
                          countryName: str              = None,
                          target                        = 'confirmed',
                          nSamples                      = N_SAMPLES,
                          nTune                         = N_TUNE,
                          nChains                       = N_CHAINS,
                          nDaysPredict                  = N_DAYS_PREDICT,
                          minCasesFilter                = MIN_CASES_FILTER,
                          priorLogCarryingCapacity      = PRIOR_LOG_CARRYING_CAPACITY,
                          priorMidPoint                 = PRIOR_MID_POINT,
                          priorGrowthRate               = PRIOR_GROWTH_RATE,
                          priorSigma                    = PRIOR_SIGMA,
                          predictionsPercentiles        = PREDICTIONS_PERCENTILES,
                          init                          = None,
                          ):
    """Predict the country with the nth highest number of cases

    Parameters
    ----------
    countryTrainIndex: Order countries from highest to lowest, and train the ith country
    countryName: Overwrites countryTrainIndex as the country to train
    target
    nSamples
    nTune
    nChains
    nDaysPredict
    minCasesFilter
    priorLogCarryingCapacity
    priorMidPoint
    priorGrowthRate
    priorSigma
    predictionsPercentiles

    Returns
    -------

    """

    confirmedCases, _, _, _ = vujson._main(target)

    if countryName is None:
        countryName = _getCountryToTrain(int(countryTrainIndex), confirmedCases)
    else:
        assert isinstance(countryName, str)

    countryTS = confirmedCases[countryName]
    countryTSClean = countryTS[countryTS > minCasesFilter]
    countryTSClean.index = pd.to_datetime(countryTSClean.index)

    t = np.arange(countryTSClean.shape[0])
    countryTSCleanLog = np.log(countryTSClean.values + 1)

    logRegModel = _initializeLogisticModel(t, countryTSCleanLog,
                                           priorLogCarryingCapacity=priorLogCarryingCapacity,
                                           priorMidPoint=priorMidPoint,
                                           priorGrowthRate=priorGrowthRate,
                                           priorSigma=priorSigma,
                                           )

    with logRegModel:
        if isinstance(init, str):
            trace = pm.sample(tune=nTune, draws=nSamples, chains=nChains, init=init)
        else:
            trace = pm.sample(tune=nTune, draws=nSamples, chains=nChains)

    predictionsMean, predictionsPercentilesTS =  _getPredictionsFromPosteriorSamples(
        t,
        trace,
        nDaysPredict,
        nSamples,
        predictionsPercentiles,
    )

    predictionsMeanTS, predictionsPercentilesTS = _castPredictionsAsTS(countryTSClean,
                                                                       nDaysPredict,
                                                                       predictionsMean,
                                                                       predictionsPercentilesTS,
                                                                       )

    countryTS.index = pd.to_datetime(countryTS.index)
    return countryTS, predictionsMeanTS, predictionsPercentilesTS, countryName, trace, countryTSClean


def _castDatetimeIndexToStr(timeSeries, dateCode = '%Y-%m-%d'):
    timeSeries.index = timeSeries.index.map(lambda s: s.strftime(dateCode))


def _dumpTimeSeriesAsJSON(timeSeries, target = None):
    assert isinstance(timeSeries.index, DatetimeIndex)
    _castDatetimeIndexToStr(timeSeries)
    result           = {
                            timeSeries.name: timeSeries.to_dict(),
                       }

    if target:
        _dumpJSON(result, target)

    return result


def _dumpPredictionCollectionAsJSON(predictionsPercentilesTS,
                                    countryName,
                                    predictionsPercentiles,
                                    target = None):
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
        _dumpJSON(result, target)

    return result


def _main(countryTrainIndex,
          predictionsPercentiles = PREDICTIONS_PERCENTILES,
          ):
    _, predictionsMeanTS, predictionsPercentilesTS, countryName, trace = predictLogisticGrowth(
        countryTrainIndex = countryTrainIndex,
        predictionsPercentiles = predictionsPercentiles,
    )

    predictionsMeanTS.name = countryName.replace(' ', '')
    _dumpTimeSeriesAsJSON(predictionsMeanTS, 'prediction-mean-%s.json' % predictionsMeanTS.name)



    _dumpPredictionCollectionAsJSON(predictionsPercentilesTS,
                                    predictionsMeanTS.name,
                                    predictionsPercentiles,
                                    'prediction-conf-int-%s.json' % predictionsMeanTS.name)


if '__main__' == __name__:
    for argument in sys.argv[1:]:
        _main(argument)
