#!/usr/bin/env python3
# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE
# vim: set fileencoding=utf-8:

from covidvu.pipeline.vujson import STATE_CODES_PATH
from covidvu.pipeline.vujson import STATE_NAMES
from covidvu.pipeline.vujson import STATE_NAMES_TO_DROP
from covidvu.pipeline.vujson import PARSING_MODE_BOUNDARY_1
from covidvu.pipeline.vujson import BOATS
from covidvu.pipeline.vujson import US_REGIONS
from covidvu.pipeline.vujson import splitCSSEDataByParsingBoundary
from covidvu.pipeline.vujson import _getBoats_mode1
from covidvu.pipeline.vujson import allUSCases
from covidvu.pipeline.vujson import _parseBoundary1
from covidvu.pipeline.vujson import _parseBoundary2
from covidvu.pipeline.vujson import _readSourceDeprecated
from covidvu.pipeline.vujson import parseCSSE
from covidvu.pipeline.vujson import resolveReportFileName

from pandas.core.frame import DataFrame
from pandas.core.indexes.datetimes import DatetimeIndex
from datetime import date
import os
import pandas as pd
import re
import json


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

# *** functions ***
def _purge(purgeDirectory, pattern):
    for f in os.listdir(purgeDirectory):
        if re.search(pattern, f):
            os.remove(os.path.join(purgeDirectory, f))

# *** tests ***
def test_STATE_CODES_PATH():
    assert os.path.exists(STATE_CODES_PATH)


def test_US_REGIONS():
    assert isinstance(US_REGIONS, dict)
    assert isinstance(US_REGIONS['Northeast'], list)


def test_splitCSSEDataByParsingBoundary():
    cases = pd.read_csv(TEST_JH_CSSE_FILE_CONFIRMED_DEPRECATED)
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


def assertDataCompatibility(casesGlobal, casesUSStates, casesUSRegions, casesBoats):
    stateCodes = pd.read_csv(STATE_CODES_PATH)
    assert "!Global" in casesGlobal.columns
    assert "!Outside China" in casesGlobal.columns
    assert isinstance(casesGlobal, DataFrame)
    assert isinstance(casesGlobal.index[0], date)
    assert (casesGlobal.loc[:, casesGlobal.columns.map(lambda c: c[0] != '!')].sum(axis=1) == casesGlobal[
        "!Global"]).all()
    assert (casesGlobal.loc[:, casesGlobal.columns.map(lambda c: c[0] != '!' and c != 'China')].sum(axis=1) ==
            casesGlobal[
                "!Outside China"]).all()

    assert isinstance(casesUSStates, DataFrame)
    assert isinstance(casesUSStates.index[0], date)
    assert stateCodes.state.isin(casesUSStates.columns).all()
    assert ~(casesUSStates.columns.isin(STATE_NAMES_TO_DROP)).any()
    assert (casesUSStates.loc[:, casesUSStates.columns.map(lambda c: c[0] != '!' and c != 'Unassigned')].sum(axis=1) ==
            casesUSStates[
                "!Total US"]).all()

    assert isinstance(casesUSRegions, DataFrame)
    assert isinstance(casesUSRegions.index[0], date)
    assert pd.DataFrame(US_REGIONS.keys()).isin(casesUSRegions.columns).values.all()

    assert isinstance(casesBoats, DataFrame)
    assert isinstance(casesBoats.index[0], date)
    assert (casesBoats.columns.isin(BOATS)).all()


def test__parseBoundary1():
    casesSplit = test_splitCSSEDataByParsingBoundary()
    output     = _parseBoundary1(casesSplit[0])

    casesGlobal    = output['casesGlobal']
    casesUSStates  = output['casesUSStates']
    casesUSRegions = output['casesUSRegions']
    casesBoats     = output['casesBoats']

    assertDataCompatibility(casesGlobal, casesUSStates, casesUSRegions, casesBoats)


def test__parseBoundary2():
    casesSplit     = test_splitCSSEDataByParsingBoundary()
    output         = _parseBoundary2(casesSplit[1])
    casesGlobal    = output['casesGlobal']
    casesUSStates  = output['casesUSStates']
    casesUSRegions = output['casesUSRegions']
    casesBoats     = output['casesBoats']
    assertDataCompatibility(casesGlobal, casesUSStates, casesUSRegions, casesBoats)


def test__readSource():
    cases = _readSourceDeprecated(TEST_JH_CSSE_FILE_CONFIRMED_DEPRECATED)
    assert not (cases['Province/State'].isin(STATE_NAMES.keys())).any()


def assertValidJSON(fname):
    fname = os.path.join(TEST_SITE_DATA, fname)
    assert os.path.exists(fname)
    with open(fname) as f:
        jsonObject = json.load(f)
    assert isinstance(jsonObject, dict)
    assert len(jsonObject.keys()) > 0


def test_parseCSSE():
    try:
        output = parseCSSE('confirmed',
                           siteData=TEST_SITE_DATA,
                           jhCSSEFileConfirmedDeprecated=TEST_JH_CSSE_FILE_CONFIRMED_DEPRECATED,
                           jhCSSEFileConfirmed=TEST_JH_CSSE_FILE_CONFIRMED,
                           jsCSSEReportPath=TEST_JH_CSSE_REPORT_PATH,
                           )
        casesGlobal = output['casesGlobal']
        casesUSStates = output['casesUSStates']
        casesUSRegions = output['casesUSRegions']
        casesBoats = output['casesBoats']
        assertDataCompatibility(casesGlobal, casesUSStates, casesUSRegions, casesBoats)
        assertValidJSON('confirmed-US-Regions.json')
        assertValidJSON('confirmed-US.json')
        assertValidJSON('confirmed-boats.json')
        assertValidJSON('confirmed.json')
    except Exception as e:
        raise e
    finally:
        _purge(TEST_SITE_DATA, '.json')

def test__combineCollection():
    # TODO: JA 20200325
    pass

def test__getReportsToLoadBoundary3():
    # TODO: JA 20200325
    pass

def test__parseGlobal():
    # TODO: JA 20200325
    pass


def test__transformReport():
    # TODO: JA 20200325
    pass


def test_resolveReportFileName():
    # TODO
    pass


def test_dumpJSON():
    #TODO
    pass


def test_dumpGlobalCasesAsJSONFor():
    # TODO
    pass


def test_dumpUSCasesAsJSONFor():
    # TODO
    pass
