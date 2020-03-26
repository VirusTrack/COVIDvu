#!/usr/bin/env python3
# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE
# vim: set fileencoding=utf-8:

from covidvu.visualize import plotTimeSeries
from covidvu.visualize import plotTimeSeriesInteractive
from covidvu.visualize import plotPrediction
from covidvu.visualize import plotDataAndPredictionsWithCI
from covidvu.visualize import castHexToRGBA_string
from covidvu.visualize import hexToRGB
from covidvu.predict import _main
from covidvu.predict import loadAll
import pandas as pd
import numpy as np
from os.path import join
import os
import re

# *** constants ***
TEST_JH_CSSE_PATH = os.path.join(os.getcwd(), 'resources', 'test_COVID-19',)

TEST_JH_CSSE_FILE_CONFIRMED             = os.path.join(TEST_JH_CSSE_PATH, 'csse_covid_19_data',
                                                       'csse_covid_19_time_series',
                                                       'time_series_covid19_confirmed_global.csv')

TEST_JH_CSSE_FILE_DEATHS                = os.path.join(TEST_JH_CSSE_PATH, 'csse_covid_19_data',
                                                       'csse_covid_19_time_series',
                                                       'time_series_covid19_deaths_global.csv')

TEST_JH_CSSE_FILE_CONFIRMED_DEPRECATED  = os.path.join(TEST_JH_CSSE_PATH, 'archived_data', 'archived_time_series',
                                                       'time_series_19-covid-Confirmed_archived_0325.csv')

TEST_JH_CSSE_FILE_DEATHS_DEPRECATED     = os.path.join(TEST_JH_CSSE_PATH, 'archived_data', 'archived_time_series',
                                                       'time_series_19-covid-Deaths_archived_0325.csv')


TEST_STATE_CODES_PATH       = os.path.join(os.getcwd(), 'stateCodesUS.csv')
TEST_SITE_DATA              = os.path.join(os.getcwd(), 'resources', 'test_site_data')
TEST_JH_CSSE_REPORT_PATH    = os.path.join(os.getcwd(), 'resources', 'test_COVID-19', 'csse_covid_19_data',
                                           'csse_covid_19_daily_reports')

TEST_JH_CSSE_FILE_CONFIRMED_SMALL = os.path.join(TEST_JH_CSSE_PATH, 'csse_covid_19_data',
                                                       'csse_covid_19_time_series',
                                                       'time_series_covid19_confirmed_global_small.csv')

# *** functions ***
def _makeTimeSeries():
    timeIndex = pd.date_range(start='23-01-2020', end='09-03-2020', freq='1D')
    return pd.DataFrame(index = timeIndex,
                        data  = np.linspace(start=0, stop=10, num=timeIndex.shape[0]))


def _makeTimeSeriesCollection():
    timeIndex = pd.date_range(start='23-01-2020', end='09-03-2020', freq='1D')
    return pd.DataFrame(index   = timeIndex,
                        data    = np.random.uniform(size=(timeIndex.shape[0],2)),
                        columns = ('a', 'b')
                        )


def _purge(purgeDirectory, pattern):
    for f in os.listdir(purgeDirectory):
        if re.search(pattern, f):
            os.remove(join(purgeDirectory, f))

# *** tests ***
def test_plotTimeSeries():
    ts = _makeTimeSeries()
    plotTimeSeries(ts.index,
                   ts.values,
                   'test',
                   'test',
                   color='blue',
                   )

    ts2 = _makeTimeSeries()
    plotTimeSeries(x=(ts.index,
                      ts2.index,
                      ),
                   y=(ts.values,
                      ts2.values
                      ),
                   name=('test',
                         'test2'
                         ),
                   yLabel='test',
                   color=('blue',
                          'green'
                          ),
                   )


def test_plotTimeSeriesInteractive():
    ts = _makeTimeSeriesCollection()
    plotTimeSeriesInteractive(ts,
                              ts.columns,
                              log=False,
                              yLabel='test'
                              )


def test_plotPrediction():
    data = meanPredictionTS = pd.Series(data=np.arange(0,10), index=np.arange(0,10))
    percentilesTS = pd.DataFrame(data=np.ones((10,4)), index = np.arange(0,10),  columns=['2.5', '97.5', '25', '75'])
    countryName = 'US'
    _, _ = plotPrediction(data, meanPredictionTS, percentilesTS, countryName, log=False)


def test_plotDataAndPredictionsWithCI():
    try:
        _main('all',
              siteData=TEST_SITE_DATA,
              nSamples=10,
              nTune=10,
              nChains=1,
              nBurn=0,
              nDaysPredict=10,
              jhCSSEFileConfirmed=TEST_JH_CSSE_FILE_CONFIRMED_SMALL,
              jhCSSEFileDeaths=TEST_JH_CSSE_FILE_DEATHS_DEPRECATED,
              jhCSSEFileConfirmedDeprecated=TEST_JH_CSSE_FILE_CONFIRMED_DEPRECATED,
              jsCSSEReportPath=TEST_JH_CSSE_REPORT_PATH,
              )

        confirmedCasesAll, meanPredictionTSAll, percentilesTSAll, = loadAll(siteData=TEST_SITE_DATA,
                                                                            jhCSSEFileConfirmed=TEST_JH_CSSE_FILE_CONFIRMED_SMALL,
                                                                            jhCSSEFileDeaths=TEST_JH_CSSE_FILE_DEATHS_DEPRECATED,
                                                                            jhCSSEFileConfirmedDeprecated=TEST_JH_CSSE_FILE_CONFIRMED_DEPRECATED,
                                                                            jsCSSEReportPath=TEST_JH_CSSE_REPORT_PATH,
                                                                            )
        _ = plotDataAndPredictionsWithCI(meanPredictionTSAll,
                                     confirmedCasesAll,
                                     percentilesTSAll,
                                     ['US', 'Italy'],
                                     )
    except Exception as e:
        raise e
    finally:
        _purge(TEST_SITE_DATA, '.json')


def test_castHexToRGBA_string():
    rgba = castHexToRGBA_string('#f28500', 0.5)
    assert isinstance(rgba, str)
    r, g, b, a = re.search(r'^rgba\((\d+), (\d+), (\d+), ([0-9].[0-9])\)$',
                           castHexToRGBA_string('#f28500', 0.5)).groups()
    assert isinstance(r, str)
    assert isinstance(g, str)
    assert isinstance(b, str)
    assert isinstance(a, str)


def test_hexToRGB():
    rgb = hexToRGB('#f28500')
    assert isinstance(rgb, tuple)
    assert len(rgb) == 3
