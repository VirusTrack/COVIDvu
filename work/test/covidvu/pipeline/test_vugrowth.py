#!/usr/bin/env python3
# See: https://github.com/VirusTrack/COVIDvu/blob/master/LICENSE
# vim: set fileencoding=utf-8:

import os
import pandas as pd
from covidvu.cryostation import Cryostation
from covidvu.config import MASTER_DATABASE
from covidvu.pipeline.vugrowth import _computeGrowthFor
from covidvu.pipeline.vugrowth import _getGrowthGaugeData
from covidvu.pipeline.vugrowth import WINDOW_SIZE
from covidvu.pipeline.vugrowth import _appendGrowthToCountries
from covidvu.pipeline.vugrowth import computeGrowth

from pandas.core.frame import DataFrame
from pandas.core.series import Series

REAL_DATABASE_PATH = './database/virustrack.db'
TEST_TODAY_DATE = pd.to_datetime('2020-04-15').date()
TEMP_DATABASE_NAME = 'temp-virustrack.db'

def makeTestDatabase():
    with Cryostation(TEMP_DATABASE_NAME) as cryostationTest:
        with Cryostation(MASTER_DATABASE) as cryostation:
            unitedStates = cryostation['US']
            california = {'confirmed': unitedStates['provinces']['California']['confirmed']}
            newYork = {'confirmed': unitedStates['provinces']['New York']['confirmed']}
            newJersey = {'confirmed': unitedStates['provinces']['New Jersey']['confirmed']}

            item = {'confirmed': unitedStates['confirmed'],
                    'provinces': {'California': california,
                                  'New York': newYork,
                                  'New Jersey': newJersey,
                                  },
                    'key': 'US'}

            cryostationTest['US'] = item

    with Cryostation(TEMP_DATABASE_NAME) as cryostationTest:
        with Cryostation(MASTER_DATABASE) as cryostation:
            italy = {'confirmed': cryostation['Italy']['confirmed'],
                     'key': 'Italy'}
            uk = {'confirmed': cryostation['United Kingdom']['confirmed'],
                  'key': 'United Kingdom'}

            cryostationTest['Italy'] = italy
            cryostationTest['United Kingdom'] = uk


def test__computeGrowthFor():
    makeTestDatabase()
    with Cryostation(TEMP_DATABASE_NAME) as cryostation:
        print('Loading time series for countries...')
        regions = cryostation.timeSeriesFor(regionType         = 'country',
                                            casesType          = 'confirmed',
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
    growthGaugeData = _getGrowthGaugeData(growth, TEST_TODAY_DATE)
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


def test__appendGrowthToCountries():
    growthGaugeData = test__getGrowthGaugeData()
    _appendGrowthToCountries(growthGaugeData, TEMP_DATABASE_NAME)
    with Cryostation(TEMP_DATABASE_NAME) as cryostationTest:
        assert isinstance(cryostationTest['US']['growth'], dict)
        assert isinstance(cryostationTest['Italy']['growth'], dict)
        assert isinstance(cryostationTest['United Kingdom']['growth'], dict)
    os.remove(TEMP_DATABASE_NAME)


def test_computeGrowth():
    makeTestDatabase()
    computeGrowth(regionType='country',
                  casesType='confirmed',
                  todayDate=TEST_TODAY_DATE,
                  databasePath=TEMP_DATABASE_NAME)
    with Cryostation(TEMP_DATABASE_NAME) as cryostationTest:
        assert isinstance(cryostationTest['US']['growth'], dict)
        assert isinstance(cryostationTest['Italy']['growth'], dict)
        assert isinstance(cryostationTest['United Kingdom']['growth'], dict)
    os.remove(TEMP_DATABASE_NAME)
