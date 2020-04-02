#!/usr/bin/env python3
# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE
# vim: set fileencoding=utf-8:

import json
import numpy as np
import os
import pandas as pd
import re

from numpy import ndarray
from os.path import join
from pandas.core.frame import DataFrame
from pandas.core.indexes.datetimes import DatetimeIndex
from pandas.core.series import Series
from pystan.model import StanModel

from covidvu.predict import _castPredictionsAsTS
from covidvu.predict import _dumpRegionPrediction
from covidvu.predict import _dumpPredictionCollectionAsJSON
from covidvu.predict import _dumpTimeSeriesAsJSON
from covidvu.predict import _getPredictionsFromPosteriorSamples
from covidvu.predict import buildLogisticModel
from covidvu.predict import castPercentilesAsDF
from covidvu.predict import getSavedShortCountryNames
from covidvu.predict import load
from covidvu.predict import loadAll
from covidvu.predict import MIN_CASES_FILTER
from covidvu.predict import predictRegions
from covidvu.predict import predictLogisticGrowth
from covidvu.predict import PREDICTIONS_PERCENTILES
from covidvu.predict import PRIOR_GROWTH_RATE
from covidvu.predict import PRIOR_LOG_CARRYING_CAPACITY
from covidvu.predict import PRIOR_MID_POINT
from covidvu.predict import PRIOR_SIGMA


# *** constants ***
TEST_SITE_DATA = os.path.join(os.getcwd(), 'resources')
TEST_JH_CSSE_PATH = os.path.join(os.getcwd(), 'resources', 'test_COVID-19','csse_covid_19_data','csse_covid_19_time_series')
TEST_JH_CSSE_FILE_CONFIRMED    = os.path.join(TEST_JH_CSSE_PATH, 'time_series_covid19_confirmed_global.csv')
TEST_JH_CSSE_FILE_DEATHS       = os.path.join(TEST_JH_CSSE_PATH, 'time_series_covid19_deaths_global.csv')
TEST_JH_CSSE_FILE_CONFIRMED_US = os.path.join(TEST_JH_CSSE_PATH, 'time_series_covid19_confirmed_US.csv')
TEST_JH_CSSE_FILE_DEATHS_US    = os.path.join(TEST_JH_CSSE_PATH, 'time_series_covid19_deaths_US')

TEST_JH_CSSE_FILE_CONFIRMED_SMALL = os.path.join(TEST_JH_CSSE_PATH,  'time_series_covid19_confirmed_global_small.csv')
TEST_N_SAMPLES = 1000
TEST_N_CHAINS = 2

# *** functions ***
def _purge(purgeDirectory, pattern):
    for f in os.listdir(purgeDirectory):
        if re.search(pattern, f):
            os.remove(join(purgeDirectory, f))


def _assertValidJSON(fname):
    assert os.path.exists(fname)
    with open(fname) as f:
        jsonObject = json.load(f)
    assert isinstance(jsonObject, dict)
    assert len(jsonObject.keys()) > 0


# *** tests ***
def test__dumpTimeSeriesAsJSON():
    lenTS     = 10
    startDate = '2020-01-01'
    startDate = pd.to_datetime(startDate).date()
    endDate   = startDate + pd.Timedelta(lenTS - 1, 'D')
    data      = np.arange(lenTS)
    
    ts = pd.Series(index = pd.date_range(start=startDate,
                                         end=endDate,
                                        ),
                   data  = data,
                   )
    try:
        _dumpTimeSeriesAsJSON(ts, target=join(TEST_SITE_DATA, 'test-ts.json'))
        _assertValidJSON(join(TEST_SITE_DATA,'test-ts.json'))

    except Exception as e:
        raise e
    finally:
        _purge(TEST_SITE_DATA, '.json')


# ----------------------------------------------------------------
# THESE TESTS MUST BE RUN IN ORDER
logGrowthModel = None
def test_buildLogisticModel():
    global logGrowthModel
    logGrowthModel = buildLogisticModel(priorLogCarryingCapacity=PRIOR_LOG_CARRYING_CAPACITY,
                                     priorMidPoint=PRIOR_MID_POINT,
                                     priorGrowthRate=PRIOR_GROWTH_RATE,
                                     priorSigma=PRIOR_SIGMA, )
    assert isinstance(logGrowthModel, StanModel)



def test_predictLogisticGrowth():
    nDaysPredict = 10
    prediction = predictLogisticGrowth(logGrowthModel,
                                       regionName                   = 'US',
                                       siteData                      = TEST_SITE_DATA,
                                       jhCSSEFileConfirmed           = TEST_JH_CSSE_FILE_CONFIRMED,
                                       jhCSSEFileDeaths              = TEST_JH_CSSE_FILE_DEATHS,
                                       jhCSSEFileConfirmedUS         = TEST_JH_CSSE_FILE_CONFIRMED_US,
                                       jhCSSEFileDeathsUS            = TEST_JH_CSSE_FILE_DEATHS_US,
                                       nSamples                      = TEST_N_SAMPLES,
                                       nChains                       = TEST_N_CHAINS,
                                       nDaysPredict                  = nDaysPredict,
                                       )

    predictionIndex = pd.date_range(start = prediction['regionTSClean'].index[0],
                                    end   = prediction['regionTSClean'].index[-1] + pd.Timedelta(nDaysPredict, 'D'),
                                    )

    assert (prediction['predictionsMeanTS'].index == predictionIndex).all()
    assert (prediction['predictionsPercentilesTS'][0][0].index == predictionIndex).all()
    assert isinstance(prediction['predictionsMeanTS'], Series)
    assert isinstance(prediction['predictionsPercentilesTS'][0][0], Series)
    assert (prediction['predictionsMeanTS'].isnull().values).sum() == 0
    assert (prediction['predictionsPercentilesTS'][0][0].isnull().values).sum() == 0
    assert isinstance(prediction['trace'], DataFrame)
    assert (prediction['regionTSClean'] > MIN_CASES_FILTER).all()
    return prediction



def test_castPercentilesAsDF():
    prediction = test_predictLogisticGrowth()
    percentiles = castPercentilesAsDF(prediction['predictionsPercentilesTS'], PREDICTIONS_PERCENTILES)
    assert isinstance(percentiles, DataFrame)
    assert '2.5' in percentiles.columns
    assert '25' in percentiles.columns
    assert '75' in percentiles.columns
    assert '97.5' in percentiles.columns



def test__dumpCountryPrediction():
    prediction = test_predictLogisticGrowth()
    try:
        _dumpRegionPrediction(prediction, TEST_SITE_DATA, PREDICTIONS_PERCENTILES)
        _assertValidJSON(join(TEST_SITE_DATA,'prediction-world-mean-US.json'))
        _assertValidJSON(join(TEST_SITE_DATA,'prediction-world-conf-int-US.json'))

    except Exception as e:
        raise e
    finally:
        _purge(TEST_SITE_DATA, '.json')



def test__getPredictionsFromPosteriorSamples():
    nDaysPredict   = 14
    prediction = test_predictLogisticGrowth()

    predictionsMean, predictionsPercentiles = _getPredictionsFromPosteriorSamples(prediction['t'],
                                                                                  prediction['trace'],
                                                                                  nDaysPredict,
                                                                                  PREDICTIONS_PERCENTILES,
                                                                                  )
    assert isinstance(predictionsMean, ndarray)
    assert len(predictionsMean) == prediction['regionTSClean'].shape[0] + nDaysPredict
    assert len(predictionsPercentiles) == len(PREDICTIONS_PERCENTILES)
    assert isinstance(predictionsPercentiles[0][0], ndarray)
    assert len(predictionsPercentiles[0][0]) == prediction['regionTSClean'].shape[0] + nDaysPredict

    prediction['predictionsMean'] = predictionsMean
    prediction['predictionsPercentiles'] = predictionsPercentiles
    prediction['nDaysPredict'] = nDaysPredict
    return prediction



def test__castPredictionsAsTS():
    predictions = test__getPredictionsFromPosteriorSamples()
    startDate   = '2020-01-01'
    startDate   = pd.to_datetime(startDate).date()
    endDate     = startDate + pd.Timedelta(len(predictions['regionTSClean'])-1, 'D')
    predictionIndex = pd.date_range(start = startDate,
                                    end   = endDate,
                                    )
    regionTSClean = pd.Series(index = predictionIndex, data  = predictions['regionTSClean'])
    predictionsMeanTS, predictionsPercentilesTS = _castPredictionsAsTS(regionTSClean,
                                                                       predictions['nDaysPredict'],
                                                                       predictions['predictionsMean'],
                                                                       predictions['predictionsPercentiles'],
                                                                       )
    assert isinstance(predictionsMeanTS, Series)
    assert predictionsMeanTS.shape[0] == len(predictions['regionTSClean']) + predictions['nDaysPredict']
    assert isinstance(predictionsMeanTS.index, DatetimeIndex)
    assert len(predictionsPercentilesTS) == len(PREDICTIONS_PERCENTILES)
    assert isinstance(predictionsPercentilesTS[0][0], Series)
    assert isinstance(predictionsPercentilesTS[0][0].index, DatetimeIndex)
    assert predictionsPercentilesTS[0][0].shape[0] == len(predictions['regionTSClean']) + predictions['nDaysPredict']
    return predictionsMeanTS, predictionsPercentilesTS, predictions



def test__dumpPredictionCollectionAsJSON():
    predictionsMeanTS, predictionsPercentilesTS, predictions = test__castPredictionsAsTS()
    try:
        _dumpPredictionCollectionAsJSON(predictionsPercentilesTS,
                                        'US',
                                        PREDICTIONS_PERCENTILES,
                                        join(TEST_SITE_DATA,'test-ts-collection.json'),
                                        )
        _assertValidJSON(join(TEST_SITE_DATA, 'test-ts-collection.json'))
    except Exception as e:
        raise e
    finally:
        _purge(TEST_SITE_DATA, '.json')



def test_predictCountries():
    try:
        predictRegions(0,
                       nDaysPredict=10,
                       siteData=TEST_SITE_DATA,
                       jhCSSEFileConfirmed=TEST_JH_CSSE_FILE_CONFIRMED,
                       jhCSSEFileDeaths=TEST_JH_CSSE_FILE_DEATHS,
                       jhCSSEFileConfirmedUS=TEST_JH_CSSE_FILE_CONFIRMED_US,
                       jhCSSEFileDeathsUS=TEST_JH_CSSE_FILE_DEATHS_US,
                       logGrowthModel=logGrowthModel,
                       nSamples=TEST_N_SAMPLES,
                       nChains=TEST_N_CHAINS,
                       )
        _assertValidJSON(join(TEST_SITE_DATA,'prediction-world-mean-US.json'))
        _assertValidJSON(join(TEST_SITE_DATA, 'prediction-world-conf-int-US.json'))

        predictRegions('all',
                       nDaysPredict=10,
                       siteData=TEST_SITE_DATA,
                       jhCSSEFileConfirmed=TEST_JH_CSSE_FILE_CONFIRMED_SMALL,
                       jhCSSEFileDeaths=TEST_JH_CSSE_FILE_DEATHS,
                       jhCSSEFileConfirmedUS=TEST_JH_CSSE_FILE_CONFIRMED_US,
                       jhCSSEFileDeathsUS=TEST_JH_CSSE_FILE_DEATHS_US,
                       logGrowthModel=logGrowthModel,
                       nSamples=TEST_N_SAMPLES,
                       nChains=TEST_N_CHAINS,
                       )

        _assertValidJSON(join(TEST_SITE_DATA, 'prediction-world-mean-Italy.json'))
        _assertValidJSON(join(TEST_SITE_DATA, 'prediction-world-conf-int-Italy.json'))
        _assertValidJSON(join(TEST_SITE_DATA, 'prediction-world-mean-US.json'))
        _assertValidJSON(join(TEST_SITE_DATA, 'prediction-world-conf-int-US.json'))

    except Exception as e:
        raise e
    finally:
        _purge(TEST_SITE_DATA, '.json')



def test_load():
    try:
        predictRegions('all',
                       nDaysPredict=10,
                       siteData=TEST_SITE_DATA,
                       jhCSSEFileConfirmed=TEST_JH_CSSE_FILE_CONFIRMED_SMALL,
                       jhCSSEFileDeaths=TEST_JH_CSSE_FILE_DEATHS,
                       jhCSSEFileConfirmedUS=TEST_JH_CSSE_FILE_CONFIRMED_US,
                       jhCSSEFileDeathsUS=TEST_JH_CSSE_FILE_DEATHS_US,
                       logGrowthModel=logGrowthModel,
                       nSamples=TEST_N_SAMPLES,
                       nChains=TEST_N_CHAINS,
                       )


        meanPredictionTS, percentilesTS, regionName = load(0, siteData=TEST_SITE_DATA)
        assert isinstance(meanPredictionTS, Series)
        assert isinstance(percentilesTS, DataFrame)
        assert isinstance(regionName, str)
        assert (percentilesTS.columns.isin(['97.5', '2.5', '25', '75'])).all()
    except Exception as e:
        raise e
    finally:
        _purge(TEST_SITE_DATA, '.json')



def test_getSavedShortCountryNames():
    try:
        predictRegions('all',
                       nDaysPredict=10,
                       siteData=TEST_SITE_DATA,
                       jhCSSEFileConfirmed=TEST_JH_CSSE_FILE_CONFIRMED_SMALL,
                       jhCSSEFileDeaths=TEST_JH_CSSE_FILE_DEATHS,
                       jhCSSEFileConfirmedUS=TEST_JH_CSSE_FILE_CONFIRMED_US,
                       jhCSSEFileDeathsUS=TEST_JH_CSSE_FILE_DEATHS_US,
                       logGrowthModel=logGrowthModel,
                       nSamples=TEST_N_SAMPLES,
                       nChains=TEST_N_CHAINS,
                       )
        regionNameShortAll = getSavedShortCountryNames(siteData=TEST_SITE_DATA)
        assert isinstance(regionNameShortAll, list)
        assert len(regionNameShortAll) == 3
    except Exception as e:
        raise e
    finally:
        _purge(TEST_SITE_DATA, '.json')



def test_loadAll():
    confirmedCasesAll, meanPredictionTSAll, percentilesTSAll, = loadAll(
        siteData=join(TEST_SITE_DATA, 'test-predictions'),
        jhCSSEFileConfirmed=TEST_JH_CSSE_FILE_CONFIRMED,
        jhCSSEFileDeaths=TEST_JH_CSSE_FILE_DEATHS,
        jhCSSEFileConfirmedUS=TEST_JH_CSSE_FILE_CONFIRMED_US,
        jhCSSEFileDeathsUS=TEST_JH_CSSE_FILE_DEATHS_US,
        )
    assert isinstance(confirmedCasesAll, DataFrame)
    assert isinstance(meanPredictionTSAll, DataFrame)
    assert isinstance(percentilesTSAll, DataFrame)


