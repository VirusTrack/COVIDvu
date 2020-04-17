#!/usr/bin/env python3
# See: https://github.com/VirusTrack/COVIDvu/blob/master/LICENSE
# vim: set fileencoding=utf-8:

import pandas as pd
from covidvu.cryostation import Cryostation
from covidvu.pipeline.vugrowth import _computeGrowthFor
from covidvu.pipeline.vugrowth import _getGrowthGaugeData
from covidvu.pipeline.vugrowth import WINDOW_SIZE
from covidvu.pipeline.vugrowth import _appendGrowthToCountries

from pandas.core.frame import DataFrame
from pandas.core.series import Series

REAL_DATABASE_PATH = './database/virustrack.db'
TODAY_DATE = pd.to_datetime('2020-04-15').date()


def test__computeGrowthFor():
    with Cryostation(REAL_DATABASE_PATH) as cryostation:
        print('Loading time series for countries...')
        regions = cryostation.timeSeriesFor(regionType         = 'country',
                                            casesType          = 'confirmed',
                                            nRegionsLimit      = 3,
                                            )
    growth = _computeGrowthFor(regions, WINDOW_SIZE)
    assert isinstance(growth, DataFrame)

    smoothCases = (regions.iloc[-WINDOW_SIZE:, 0].mean(),
                   regions.iloc[-WINDOW_SIZE-1:-1, 0].mean(),
                   regions.iloc[-WINDOW_SIZE-2:-2, 0].mean(),
                   )
    growthFactorExpectedFinal = (smoothCases[0] - smoothCases[1])/(smoothCases[1] - smoothCases[2])
    assert abs(growth.iloc[-1,0] - growthFactorExpectedFinal) < 1e-4

    return growth


def test__getGrowthGaugeData():
    growth = test__computeGrowthFor()
    growthGaugeData = _getGrowthGaugeData(growth, TODAY_DATE)
    assert 'yesterday' in growthGaugeData
    assert 'lastWeek' in growthGaugeData
    assert 'lastTwoWeek' in growthGaugeData
    assert isinstance(growthGaugeData['yesterday'], Series)
    assert isinstance(growthGaugeData['lastWeek'], Series)
    assert isinstance(growthGaugeData['lastTwoWeek'], Series)
    assert (growth.columns.isin(growthGaugeData['yesterday'].index)).all()
    assert (growth.columns.isin(growthGaugeData['lastWeek'].index)).all()
    assert (growth.columns.isin(growthGaugeData['lastTwoWeek'].index)).all()
    return growthGaugeData


def test__growthGaugeData():

