#!/usr/bin/env python3
# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE
# vim: set fileencoding=utf-8:

import os
import json
import re
import numpy as np
import pandas as pd
import pymc3 as pm

from os.path import join

from numpy import ndarray
from pandas.core.series import Series
from pandas.core.indexes.datetimes import DatetimeIndex
from pymc3.backends.base import MultiTrace
from pymc3.model import Model

from covidvu.predict import _castPredictionsAsTS
from covidvu.predict import _dumpCountryPrediction
from covidvu.predict import _dumpPredictionCollectionAsJSON
from covidvu.predict import _dumpTimeSeriesAsJSON
from covidvu.predict import _getPredictionsFromPosteriorSamples
from covidvu.predict import _initializeLogisticModel
from covidvu.predict import _main
from covidvu.predict import MIN_CASES_FILTER
from covidvu.predict import PREDICTIONS_PERCENTILES
from covidvu.predict import predictLogisticGrowth
from covidvu.predict import PRIOR_GROWTH_RATE
from covidvu.predict import PRIOR_LOG_CARRYING_CAPACITY
from covidvu.predict import PRIOR_MID_POINT
from covidvu.predict import PRIOR_SIGMA


# *** constants ***
TEST_JH_CSSE_DATA_HOME      = join(os.getcwd(), 'resources', 'test_COVID-19', 'csse_covid_19_data',
                                           'csse_covid_19_time_series')
TEST_SITE_DATA              = join(os.getcwd(), 'resources', 'test_site_data')
TEST_JH_CSSE_FILE_CONFIRMED = join(TEST_JH_CSSE_DATA_HOME, 'time_series_19-covid-Confirmed.csv')

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
def test_predictLogisticGrowth():
    nDaysPredict = 10
    prediction = predictLogisticGrowth(countryName         = 'US',
                                       target              = 'confirmed',
                                       subGroup            = 'casesGlobal',
                                       nSamples            = 10,
                                       nTune               = 10,
                                       nChains             = 1,
                                       nBurn               = 0,
                                       nDaysPredict        = 10,
                                       siteData            = TEST_SITE_DATA,
                                       jhCSSEFileConfirmed = TEST_JH_CSSE_FILE_CONFIRMED,
                                       )
    predictionIndex = pd.date_range(start = prediction['countryTSClean'].index[0],
                                    end   = prediction['countryTSClean'].index[-1] + pd.Timedelta(nDaysPredict, 'D'),
                                    )

    assert (prediction['predictionsMeanTS'].index == predictionIndex).all()
    assert (prediction['predictionsPercentilesTS'][0][0].index == predictionIndex).all()
    assert isinstance(prediction['predictionsMeanTS'], Series)
    assert isinstance(prediction['predictionsPercentilesTS'][0][0], Series)
    assert (prediction['predictionsMeanTS'].isnull().values).sum() == 0
    assert (prediction['predictionsPercentilesTS'][0][0].isnull().values).sum() == 0
    assert isinstance(prediction['trace'], MultiTrace)
    assert (prediction['countryTSClean'] > MIN_CASES_FILTER).all()
    return prediction


def test__initializeLogisticModel():
    t = np.arange(20)
    data = 0.5*np.exp(0.15*t)
    dataLog = np.log(data)
    logRegModel = _initializeLogisticModel(t,
                                           dataLog,
                                           PRIOR_LOG_CARRYING_CAPACITY,
                                           PRIOR_MID_POINT,
                                           PRIOR_GROWTH_RATE,
                                           PRIOR_SIGMA,
                                           )
    assert isinstance(logRegModel, Model)
    return t, logRegModel, dataLog


def test__getPredictionsFromPosteriorSamples():
    nSamples       = 10
    nDaysPredict   = 14
    t, logRegModel, dataLog = test__initializeLogisticModel()
    with logRegModel:
        trace = pm.sample(tune        = 10,
                          draws       = nSamples,
                          chains      = 1,
                          random_seed = 2020,
                          )
    predictionsMean, predictionsPercentiles = _getPredictionsFromPosteriorSamples(t,
                                                                                    trace,
                                                                                    nDaysPredict,
                                                                                    nSamples,
                                                                                    PREDICTIONS_PERCENTILES,
                                                                                    0,
                                                                                    )
    assert isinstance(predictionsMean, ndarray)
    assert len(predictionsMean) == len(dataLog) + nDaysPredict
    assert len(predictionsPercentiles) == len(PREDICTIONS_PERCENTILES)
    assert isinstance(predictionsPercentiles[0][0], ndarray)
    assert len(predictionsPercentiles[0][0]) == len(dataLog) + nDaysPredict

    output = {
                  'predictionsMean':          predictionsMean,
                  'predictionsPercentiles': predictionsPercentiles,
                  'dataLog':           dataLog,
                  'nDaysPredict':             nDaysPredict,
             }

    return output


def test__castPredictionsAsTS():
    predictions = test__getPredictionsFromPosteriorSamples()
    startDate   = '2020-01-01'
    startDate   = pd.to_datetime(startDate).date()
    endDate     = startDate + pd.Timedelta(len(predictions['dataLog'])-1, 'D')
    predictionIndex = pd.date_range(start = startDate,
                                    end   = endDate,
                                    )
    countryTSClean = pd.Series(index = predictionIndex, data  = predictions['dataLog'])
    predictionsMeanTS, predictionsPercentilesTS = _castPredictionsAsTS(countryTSClean,
                                                                       predictions['nDaysPredict'],
                                                                       predictions['predictionsMean'],
                                                                       predictions['predictionsPercentiles'],
                                                                       )
    assert isinstance(predictionsMeanTS, Series)
    assert predictionsMeanTS.shape[0] == len(predictions['dataLog']) + predictions['nDaysPredict']
    assert isinstance(predictionsMeanTS.index, DatetimeIndex)
    assert len(predictionsPercentilesTS) == len(PREDICTIONS_PERCENTILES)
    assert isinstance(predictionsPercentilesTS[0][0], Series)
    assert isinstance(predictionsPercentilesTS[0][0].index, DatetimeIndex)
    assert predictionsPercentilesTS[0][0].shape[0] == len(predictions['dataLog']) + predictions['nDaysPredict']
    return predictionsMeanTS, predictionsPercentilesTS, predictions


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


def test__main():
    try:
        _main(0, siteData=TEST_SITE_DATA,
              nSamples            = 10,
              nTune               = 10,
              nChains             = 1,
              nBurn               = 0,
              nDaysPredict        = 10,
              )
        _assertValidJSON(join(TEST_SITE_DATA,'prediction-mean-China.json'))
        _assertValidJSON(join(TEST_SITE_DATA, 'prediction-conf-int-China.json'))

        # TODO test all

    except Exception as e:
        raise e
    finally:
        _purge(TEST_SITE_DATA, '.json')


def test__dumpCountryPrediction():
    prediction = test_predictLogisticGrowth()
    try:
        _dumpCountryPrediction(prediction, TEST_SITE_DATA, PREDICTIONS_PERCENTILES)
        _assertValidJSON(join(TEST_SITE_DATA,'prediction-mean-US.json'))
        _assertValidJSON(join(TEST_SITE_DATA,'prediction-conf-int-US.json'))

    except Exception as e:
        raise e
    finally:
        _purge(TEST_SITE_DATA, '.json')


