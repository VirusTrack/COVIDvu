#!/usr/bin/env python3
# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE
# vim: set fileencoding=utf-8:

import os
import pandas as pd
from pandas.core.series import Series
from pymc3.backends.base import MultiTrace

from covidvu.pipeline.vujson import parseCSSE
from covidvu.predict import predictLogisticGrowth
from covidvu.predict import MIN_CASES_FILTER
from covidvu.predict import PREDICTIONS_PERCENTILES
from covidvu.predict import _initializeLogisticModel
from covidvu.predict import _getPredictionsFromPosteriorSamples
from covidvu.predict import _castPredictionsAsTS
from covidvu.predict import _dumpTimeSeriesAsJSON
from covidvu.predict import _dumpPredictionCollectionAsJSON

# *** constants ***
TEST_JH_CSSE_DATA_HOME      = os.path.join(os.getcwd(), 'resources', 'test_COVID-19', 'csse_covid_19_data',
                                           'csse_covid_19_time_series')
TEST_SITE_DATA              = os.path.join(os.getcwd(), 'resources', 'test-site-data')
TEST_JH_CSSE_FILE_CONFIRMED = os.path.join(TEST_JH_CSSE_DATA_HOME, 'time_series_19-covid-Confirmed.csv')

# *** functions ***

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


def test__initializeLogisticModel():
    # _initializeLogisticModel
    # TODO
    raise NotImplementedError


def test__getPredictionsFromPosteriorSamples():
    # _getPredictionsFromPosteriorSamples
    # TODO
    raise NotImplementedError


def test__castPredictionsAsTS():
    # _castPredictionsAsTS
    # TODO
    raise NotImplementedError


def test__dumpTimeSeriesAsJSON():
    # _dumpTimeSeriesAsJSON
    # TODO
    raise NotImplementedError


def test__dumpPredictionCollectionAsJSON():
    # _dumpPredictionCollectionAsJSON
    # TODO
    raise NotImplementedError

