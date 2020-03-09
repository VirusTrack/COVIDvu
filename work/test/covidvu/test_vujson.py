#!/usr/bin/env python3
# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE
# vim: set fileencoding=utf-8:

from covidvu.vujson import STATE_CODES_PATH
from covidvu.vujson import US_REGIONS
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
import pandas as pd


# *** constants ***
TEST_JH_CSSE_DATA_HOME      = os.path.join(os.getcwd(), 'resources', 'test_COVID-19', 'csse_covid_19_data',
                                           'csse_covid_19_time_series')
TEST_JH_CSSE_FILE_CONFIRMED = os.path.join(TEST_JH_CSSE_DATA_HOME, 'time_series_19-covid-Confirmed.csv')
TEST_JH_CSSE_FILE_DEATHS    = os.path.join(TEST_JH_CSSE_DATA_HOME, 'time_series_19-covid-Deaths.csv')
TEST_JH_CSSE_FILE_RECOVERED = os.path.join(TEST_JH_CSSE_DATA_HOME, 'time_series_19-covid-Recovered.csv')
TEST_STATE_CODES_PATH       = os.path.join(os.getcwd(), 'stateCodesUS.csv')

# *** functions ***


# *** tests ***
def test_STATE_CODES_PATH():
    assert os.path.exists(STATE_CODES_PATH)


def test_US_REGIONS():
    assert isinstance(US_REGIONS, dict)
    assert isinstance(US_REGIONS['Northeast'], list)


def test_allCases():
    confirmedCases = allCases(fileName = TEST_JH_CSSE_FILE_CONFIRMED)
    assert isinstance(confirmedCases, DataFrame)
    assert isinstance(confirmedCases.index, DatetimeIndex)
    assert "!Global" in confirmedCases.columns
    assert "!Outside Mainland China" in confirmedCases.columns


def test__resampleByStateUS():
    cases          = pd.read_csv(TEST_JH_CSSE_FILE_CONFIRMED)
    casesUS        = cases[cases['Country/Region'] == 'US'].drop('Country/Region', axis=1).set_index('Province/State').T
    casesUS        = casesUS.iloc[2:]
    casesUS.index  = pd.to_datetime(casesUS.index)
    casesUS.index  = casesUS.index.map(lambda s: s.date())
    casesByStateUS =  _resampleByStateUS(casesUS.copy())
    states = pd.read_csv(STATE_CODES_PATH)['state']
    assert isinstance(casesByStateUS, DataFrame)
    assert isinstance(casesByStateUS.index, DatetimeIndex)
    assert states.isin(casesByStateUS.columns).all()
    return casesUS


def test__resampleByRegionUS():
    casesUS         = test__resampleByStateUS()
    casesByRegionUS = _resampleByRegionUS(casesUS)
    assert isinstance(casesByRegionUS, DataFrame)
    assert isinstance(casesByRegionUS.index, DatetimeIndex)
    assert pd.DataFrame(US_REGIONS.keys()).isin(casesByRegionUS.columns).values.all()


def test_allUSCases():
    casesByStateUS, casesByRegionUS = allUSCases(TEST_JH_CSSE_FILE_CONFIRMED)
    states = pd.read_csv(STATE_CODES_PATH)['state']

    assert isinstance(casesByStateUS, DataFrame)
    assert isinstance(casesByStateUS.index, DatetimeIndex)
    assert states.isin(casesByStateUS.columns).all()
    assert isinstance(casesByRegionUS, DataFrame)
    assert isinstance(casesByRegionUS.index, DatetimeIndex)
    assert pd.DataFrame(US_REGIONS.keys()).isin(casesByRegionUS.columns).values.all()


def test__dumpJSON():
    #TODO
    pass


def test_dumpGlobalCasesAsJSONFor():
    # TODO
    pass


def test_dumpUSCasesAsJSONFor():
    # TODO
    pass
