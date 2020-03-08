#!/usr/bin/env python3
# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE
# vim: set fileencoding=utf-8:

from covidvu.vujson import allCases
from covidvu.vujson import _resampleByStateUS
from covidvu.vujson import _resampleByRegionUS
from covidvu.vujson import allUSCases
from covidvu.vujson import _dumpJSON
from covidvu.vujson import dumpGlobalCasesAsJSONFor
from covidvu.vujson import dumpUSCasesAsJSONFor

from pandas.core.frame import DataFrame
from pandas.core.indexes.datetimes import DatetimeIndex
import os


# *** constants ***
TEST_JH_CSSE_DATA_HOME      = os.path.join(os.getcwd(), 'resources', 'test_COVID-19', 'csse_covid_19_data',
                                           'csse_covid_19_time_series')
TEST_JH_CSSE_FILE_CONFIRMED = os.path.join(TEST_JH_CSSE_DATA_HOME, 'time_series_19-covid-Confirmed.csv')
TEST_JH_CSSE_FILE_DEATHS    = os.path.join(TEST_JH_CSSE_DATA_HOME, 'time_series_19-covid-Deaths.csv')
TEST_JH_CSSE_FILE_RECOVERED = os.path.join(TEST_JH_CSSE_DATA_HOME, 'time_series_19-covid-Recovered.csv')
TEST_STATE_CODES_PATH       = os.path.join(os.getcwd(), 'stateCodesUS.csv')

# *** functions ***


# *** tests ***
def test_allCases():
    confirmedCases = allCases(fileName = TEST_JH_CSSE_FILE_CONFIRMED)
    assert isinstance(confirmedCases, DataFrame)
    assert isinstance(confirmedCases.index, DatetimeIndex)
    assert "!Global" in confirmedCases.columns
    assert "!Outside Mainland China" in confirmedCases.columns

def test__resampleByStateUS():
    # TODO
    pass

def test__resampleByRegionUS():
    #TODO
    pass

def test_allUSCases():
    # TODO
    pass

def test__dumpJSON():
    #TODO
    pass

def test_dumpGlobalCasesAsJSONFor():
    # TODO
    pass

def test_dumpUSCasesAsJSONFor():
    # TODO
    pass
