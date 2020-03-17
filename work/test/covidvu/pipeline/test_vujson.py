#!/usr/bin/env python3
# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE
# vim: set fileencoding=utf-8:

from covidvu.pipeline.vujson import STATE_CODES_PATH
from covidvu.pipeline.vujson import PARSING_MODE_BOUNDARY_1
from covidvu.pipeline.vujson import BOATS
from covidvu.pipeline.vujson import US_REGIONS
from covidvu.pipeline.vujson import splitCSSEDataByParsingBoundary
from covidvu.pipeline.vujson import _getBoats_mode1
from covidvu.pipeline.vujson import allUSCases
from covidvu.pipeline.vujson import splitCSSEData

# from covidvu.pipeline.vujson import allCases
# from covidvu.pipeline.vujson import _resampleByStateUS_mode1
# from covidvu.pipeline.vujson import _resampleByRegionUS_mode1
# from covidvu.pipeline.vujson import allUSCases
#
# from covidvu.pipeline.vujson import _dumpJSON
# from covidvu.pipeline.vujson import dumpGlobalCasesAsJSONFor
# from covidvu.pipeline.vujson import dumpUSCasesAsJSONFor

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


def test_splitCSSEDataByParsingBoundary():
    cases = pd.read_csv(TEST_JH_CSSE_FILE_CONFIRMED)
    casesSplit = splitCSSEDataByParsingBoundary(cases)
    assert isinstance(casesSplit[0], DataFrame)
    assert isinstance(casesSplit[1], DataFrame)
    assert (casesSplit[0].index < PARSING_MODE_BOUNDARY_1).all()
    assert (casesSplit[1].index >= PARSING_MODE_BOUNDARY_1).all()
    return casesSplit


def test__getBoats_mode1():
    casesSplit = test_splitCSSEDataByParsingBoundary()
    casesBoats, casesNotBoats  = _getBoats_mode1(casesSplit[0])
    assert not (casesNotBoats.columns.droplevel(level=1).isin(BOATS)).any()
    return casesBoats, casesNotBoats


def test_allUSCases():
    stateCodes = pd.read_csv(STATE_CODES_PATH)
    casesBoats, casesNotBoats = test__getBoats_mode1()
    casesByStateUS, casesByRegionUS = allUSCases(casesNotBoats)
    assert isinstance(casesByStateUS, DataFrame)
    assert isinstance(casesByStateUS.index, DatetimeIndex)
    assert stateCodes.state.isin(casesByStateUS.columns).all()
    assert isinstance(casesByRegionUS, DataFrame)
    assert isinstance(casesByRegionUS.index, DatetimeIndex)
    assert pd.DataFrame(US_REGIONS.keys()).isin(casesByRegionUS.columns).values.all()


def test_splitCSSEData():
    stateCodes     = pd.read_csv(STATE_CODES_PATH)
    casesSplit     = test_splitCSSEDataByParsingBoundary()
    output         = splitCSSEData(casesSplit[1])
    casesGlobal    = output['casesGlobal']
    casesUSRegions = output['casesUSRegions']
    casesUSStates  = output['casesUSStates']
    casesBoats     = output['casesBoats']

    assert "!Global" in casesGlobal.columns
    assert "!Outside China" in casesGlobal.columns
    assert (casesGlobal.loc[:,casesGlobal.columns.map(lambda c: c[0]!='!')].sum(axis=1) == casesGlobal["!Global"]).all()
    assert (casesGlobal.loc[:, casesGlobal.columns.map(lambda c: c[0] != '!' and c != 'China')].sum(axis=1) == casesGlobal[
        "!Outside China"]).all()
    # TODO: Pick up from here!

#
# def test_allUSCases():
#     # TODO: Juvid - https://github.com/pr3d4t0r/COVIDvu/issues/162
#     casesByStateUS, casesByRegionUS = allUSCases(TEST_JH_CSSE_FILE_CONFIRMED)
#     states = pd.read_csv(STATE_CODES_PATH)['state']
#
#     assert isinstance(casesByStateUS, DataFrame)
#     assert isinstance(casesByStateUS.index, DatetimeIndex)
#     assert states.isin(casesByStateUS.columns).all()
#     assert isinstance(casesByRegionUS, DataFrame)
#     assert isinstance(casesByRegionUS.index, DatetimeIndex)
#     assert pd.DataFrame(US_REGIONS.keys()).isin(casesByRegionUS.columns).values.all()


def test__dumpJSON():
    #TODO
    pass


def test_dumpGlobalCasesAsJSONFor():
    # TODO
    pass


def test_dumpUSCasesAsJSONFor():
    # TODO
    pass
