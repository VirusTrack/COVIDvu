#!/usr/bin/env python3
# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE
# vim: set fileencoding=utf-8:

from covidvu.visualize import plotTimeSeries
from covidvu.visualize import plotTimeSeriesInteractive
import pandas as pd
import numpy as np

# *** constants ***


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
    raise NotImplementedError
