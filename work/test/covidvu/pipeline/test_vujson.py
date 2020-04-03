#!/usr/bin/env python3
# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE
# vim: set fileencoding=utf-8:


from covidvu.pipeline.vujson import BOATS
from covidvu.pipeline.vujson import _getCountyCounts
from covidvu.pipeline.vujson import _getStateCounts
from covidvu.pipeline.vujson import _parseGlobal
from covidvu.pipeline.vujson import _renameCounties
from covidvu.pipeline.vujson import _resampleByRegionUS
from covidvu.pipeline.vujson import dumpGlobalCasesAsJSONFor
from covidvu.pipeline.vujson import dumpJSON
from covidvu.pipeline.vujson import dumpUSCasesAsJSONFor
from covidvu.pipeline.vujson import dumpUSCountiesAsJSONFor
from covidvu.pipeline.vujson import parseCSSE
from covidvu.virustrack.countryinfo import US_REGIONS

from pandas.core.frame import DataFrame
from datetime import date
import os
import re
import json
import pandas as pd


# *** constants ***
TEST_SITE_DATA = os.path.join(os.getcwd(), 'resources', 'test_site_data')
TEST_JH_CSSE_PATH = os.path.join(os.getcwd(), 'resources', 'test_COVID-19','csse_covid_19_data','csse_covid_19_time_series')
TEST_JH_CSSE_FILE_CONFIRMED    = os.path.join(TEST_JH_CSSE_PATH, 'time_series_covid19_confirmed_global.csv')
TEST_JH_CSSE_FILE_DEATHS       = os.path.join(TEST_JH_CSSE_PATH, 'time_series_covid19_deaths_global.csv')
TEST_JH_CSSE_FILE_CONFIRMED_US = os.path.join(TEST_JH_CSSE_PATH, 'time_series_covid19_confirmed_US.csv')
TEST_JH_CSSE_FILE_DEATHS_US    = os.path.join(TEST_JH_CSSE_PATH, 'time_series_covid19_deaths_US.csv')


# *** functions ***
def _purge(purgeDirectory, pattern):
    for f in os.listdir(purgeDirectory):
        if re.search(pattern, f):
            os.remove(os.path.join(purgeDirectory, f))

# *** tests ***


def assertValidJSON(fname):
    fname = os.path.join(TEST_SITE_DATA, fname)
    assert os.path.exists(fname)
    with open(fname) as f:
        jsonObject = json.load(f)
    assert isinstance(jsonObject, dict)
    assert len(jsonObject.keys()) > 0


def assertDataCompatibility(casesGlobal, casesUSStates, casesUSRegions, casesBoats, casesUSCounties):
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
    assert casesUSStates.columns.isin(US_REGIONS.keys()).all()
    assert (casesUSStates.loc[:, casesUSStates.columns.map(lambda c: c[0] != '!')].sum(axis=1) ==
            casesUSStates[
                "!Total US"]).all()

    assert isinstance(casesUSRegions, DataFrame)
    assert isinstance(casesUSRegions.index[0], date)
    assert casesUSRegions.columns.isin(list(set(US_REGIONS.values()))).all()

    assert isinstance(casesBoats, DataFrame)
    assert isinstance(casesBoats.index[0], date)
    assert (casesBoats.columns.isin(BOATS)).all()

    assert isinstance(casesUSCounties, DataFrame)


def checkParsing(target):
    output = parseCSSE(target,
                       siteData=TEST_SITE_DATA,
                       jhCSSEFileConfirmed=TEST_JH_CSSE_FILE_CONFIRMED,
                       jhCSSEFileDeaths=TEST_JH_CSSE_FILE_DEATHS,
                       jhCSSEFileConfirmedUS=TEST_JH_CSSE_FILE_CONFIRMED_US,
                       jhCSSEFileDeathsUS=TEST_JH_CSSE_FILE_DEATHS_US,
                       )
    casesGlobal = output['casesGlobal']
    casesUSStates = output['casesUSStates']
    casesUSRegions = output['casesUSRegions']
    casesBoats = output['casesBoats']
    casesUSCounties = output['casesUSCounties']

    assertDataCompatibility(casesGlobal, casesUSStates, casesUSRegions, casesBoats, casesUSCounties)


def test_parseCSSE():
    try:
        checkParsing('confirmed')
        assertValidJSON('confirmed-US-Regions.json')
        assertValidJSON('confirmed-US.json')
        assertValidJSON('confirmed-boats.json')
        assertValidJSON('confirmed.json')
        assertValidJSON('confirmed-US-Counties.json')

        checkParsing('deaths')
        assertValidJSON('deaths-US-Regions.json')
        assertValidJSON('deaths-US.json')
        assertValidJSON('deaths-boats.json')
        assertValidJSON('deaths.json')
        assertValidJSON('deaths-US-Counties.json')

    except Exception as e:
        raise e
    finally:
        _purge(TEST_SITE_DATA, '.json')


def test__parseGlobal():
    casesGlobal, casesBoats = _parseGlobal(TEST_JH_CSSE_FILE_CONFIRMED)
    assert "!Global" in casesGlobal.columns
    assert "!Outside China" in casesGlobal.columns
    assert isinstance(casesGlobal, DataFrame)
    assert isinstance(casesGlobal.index[0], date)
    assert (casesGlobal.loc[:, casesGlobal.columns.map(lambda c: c[0] != '!')].sum(axis=1) == casesGlobal[
        "!Global"]).all()
    assert (casesGlobal.loc[:, casesGlobal.columns.map(lambda c: c[0] != '!' and c != 'China')].sum(axis=1) ==
            casesGlobal[
                "!Outside China"]).all()
    assert isinstance(casesBoats, DataFrame)
    assert isinstance(casesBoats.index[0], date)
    assert (casesBoats.columns.isin(BOATS)).all()


def test__resampleByRegionUS():
    # TODO - Juvid 20203031
    pass

def test_dumpJSON():
    # TODO - Juvid 20203031
    pass

def test_dumpGlobalCasesAsJSONFor():
    # TODO - Juvid 20203031
    pass

def test_dumpUSCasesAsJSONFor():
    # TODO - Juvid 20203031
    pass

def test_dumpUSCountiesAsJSONFor():
    # TODO - Juvid 20203031
    pass

def test__getStateCounts():
    # TODO - Juvid 20203031
    pass

def test__getCountyCounts():
    # TODO - Juvid 20203031
    pass

def test__renameCounties():
    # TODO - Juvid 20203031
    pass


