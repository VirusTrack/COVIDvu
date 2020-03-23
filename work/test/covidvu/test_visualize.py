#!/usr/bin/env python3
# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE
# vim: set fileencoding=utf-8:

from covidvu.visualize import plotTimeSeries
from covidvu.visualize import plotTimeSeriesInteractive
from covidvu.visualize import plotPrediction
from covidvu.visualize import plotDataAndPredictionsWithCI
from covidvu.predict import _main
from covidvu.predict import loadAll
import pandas as pd
import numpy as np
from os.path import join
import os
import re

# *** constants ***
TEST_JH_CSSE_DATA_HOME           = join(os.getcwd(), 'resources', 'test_COVID-19', 'csse_covid_19_data',
                                           'csse_covid_19_time_series')
TEST_SITE_DATA                   = join(os.getcwd(), 'resources', 'test_site_data')
TEST_JH_CSSE_FILE_CONFIRMED      = join(TEST_JH_CSSE_DATA_HOME, 'time_series_19-covid-Confirmed.csv')
TEST_JH_CSSEFILE_CONFIRMED_SMALL = join(TEST_JH_CSSE_DATA_HOME, 'time_series_19-covid-Confirmed-small.csv')

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
              jhCSSEFileConfirmed=TEST_JH_CSSEFILE_CONFIRMED_SMALL,
              )

        confirmedCasesAll, meanPredictionTSAll, percentilesTSAll, = loadAll(siteData=TEST_SITE_DATA)
        _ = plotDataAndPredictionsWithCI(meanPredictionTSAll,
                                     confirmedCasesAll,
                                     percentilesTSAll,
                                     ['US', 'Italy'],
                                     )
    except Exception as e:
        raise e
    finally:
        _purge(TEST_SITE_DATA, '.json')
