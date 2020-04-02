import json
import os
import sys

import pandas as pd
import re
from covidvu import utils
# *** initializations ***

pd.options.mode.chained_assignment = None


# *** constants ***

JH_CSSE_DATA_HOME                  = 'COVID-19'
TOTAL_US_NAME = '!Total US'

# -- 20200325 - CSSE broke this again:
JH_CSSE_ARCHIVED_PATH              = os.path.join(os.path.join(os.getcwd(), JH_CSSE_DATA_HOME), 'archived_data/archived_time_series')
JH_CSSE_FILE_CONFIRMED_DEPRECATED  = os.path.join(JH_CSSE_ARCHIVED_PATH, 'time_series_19-covid-Confirmed_archived_0325.csv')
JH_CSSE_FILE_DEATHS_DEPRECATED     = os.path.join(JH_CSSE_ARCHIVED_PATH, 'time_series_19-covid-Deaths_archived_0325.csv')
JH_CSSE_FILE_RECOVERED_DEPRECATED  = os.path.join(JH_CSSE_ARCHIVED_PATH, 'time_series_19-covid-Recovered_archived_0325.csv')

JH_CSSE_PATH                       = os.path.join(os.path.join(os.getcwd(), JH_CSSE_DATA_HOME), 'csse_covid_19_data/csse_covid_19_time_series')
JH_CSSE_FILE_CONFIRMED             = os.path.join(JH_CSSE_PATH, 'time_series_covid19_confirmed_global.csv')
JH_CSSE_FILE_DEATHS                = os.path.join(JH_CSSE_PATH, 'time_series_covid19_deaths_global.csv')
JH_CSSE_FILE_CONFIRMED_US          = os.path.join(JH_CSSE_PATH, 'time_series_covid19_confirmed_US.csv')
JH_CSSE_FILE_DEATHS_US             = os.path.join(JH_CSSE_PATH, 'time_series_covid19_deaths_US')

JH_CSSE_REPORT_PATH                = os.path.join(os.path.join(os.getcwd(), JH_CSSE_DATA_HOME), 'csse_covid_19_data/csse_covid_19_daily_reports')

SITE_DATA                          = './site-data'
STATE_CODES_PATH                   = os.path.join(os.getcwd(), 'stateCodesUS.csv')

PARSING_MODE_BOUNDARY_1            = '2020-03-10'  # From this date (inclusive), new parsing rules
PARSING_MODE_BOUNDARY_2            = '2020-03-24'  # From this date (inclusive), new parsing rules

STATE_NAMES_TO_DROP = ('US', 'Northern Mariana Islands', 'Recovered', 'Wuhan Evacuee')
BOATS = (
         'Diamond Princess',
         'Grand Princess',
        )
BOAT_NAMES = {
                'From Diamond Princess': 'Diamond Princess',
             }

US_REGIONS = {
    'Northeast': sorted([ 'CT', 'ME', 'MA', 'NH', 'RI', 'VT', 'NJ', 'NY', 'PA', ]),
    'Midwest': sorted([ 'IL', 'IN', 'MI', 'OH', 'WI', 'IA', 'KS', 'MN', 'MO', 'NE', 'ND', 'SD', ]),
    'South': sorted([ 'DE', 'GA', 'FL', 'MD', 'NC', 'SC', 'VA', 'DC', 'WV', 'AL', 'KY', 'MS', 'TN', 'AR', 'LA', 'OK', 'TX', ]),
    'West': sorted([ 'AZ', 'CO', 'ID', 'MT', 'NV', 'NM', 'UT', 'WY', 'AK', 'CA', 'HI', 'OR', 'WA', ] ),
}
COUNTRY_NAMES = {
                    'Mainland China': 'China',
                }

STATE_NAMES = {
                    'Washington, D.C.': 'Washington D.C.',
                    'United States Virgin Islands': 'Virgin Islands',
                    'Northern Mariana Islands': 'Marianas',
                }

def _isCounty(c):
    if re.search(r", [A-Z][A-Z]", c):
        return True
    else:
        return False

def _orderAxes(df):
    df = df.reindex(sorted(df.columns), axis=1)
    df.index = pd.to_datetime(df.index)

def splitCSSEDataByParsingBoundary(cases):
    cases = [cases.loc[cases.index  < PARSING_MODE_BOUNDARY_1],
             cases.loc[cases.index >= PARSING_MODE_BOUNDARY_1]]

    return cases



def _resampleByStateUS_mode2(casesUS):
    stateCodes = pd.read_csv(STATE_CODES_PATH)

    statesWithoutCases   = stateCodes[~stateCodes['state'].isin(casesUS.columns)]['state']
    for stateName in statesWithoutCases:
        casesUS[stateName] = 0

    casesUS[TOTAL_US_NAME] = casesUS.loc[:, casesUS.columns != 'Unassigned'].sum(axis=1)
    casesUS = casesUS.reindex(sorted(casesUS.columns), axis=1)
    casesUS.index = pd.to_datetime(casesUS.index)
    return casesUS


def _resampleByStateUS_mode1(casesUS):
    states     = []
    stateCodes = pd.read_csv(STATE_CODES_PATH)
    for province in casesUS.columns:
        match = re.search(r', ([A-Z][A-Z])', province)
        if match:
            postalCode = match.groups()[0]
            code       = stateCodes[stateCodes['postalCode'] == postalCode]
            assert code.shape[0] == 1
            states.append(code['state'].iloc[0])
        else:
            states.append('Unassigned')

    casesUS.columns      = states
    casesUS              = casesUS.groupby(casesUS.columns, axis=1).sum()

    statesWithoutCases   = stateCodes[~stateCodes['state'].isin(casesUS.columns)]['state']
    for stateName in statesWithoutCases:
        casesUS[stateName] = 0

    casesUS[TOTAL_US_NAME] = casesUS.loc[:, casesUS.columns != 'Unassigned'].sum(axis=1)
    casesUS              = casesUS.reindex(sorted(casesUS.columns), axis=1)
    casesUS.index        = pd.to_datetime(casesUS.index)
    return casesUS


def _resampleByRegionUS_mode1(casesUS):
    regions = []
    for province in casesUS.columns:
        match = re.search(r', ([A-Z][A-Z])', province)
        if match:
            postalCode  = match.groups()[0]
            regionFound = False
            for region in US_REGIONS:
                if postalCode in US_REGIONS[region]:
                    regions.append(region)
                    regionFound = True
                    break
            if not regionFound:
                regions.append('Unassigned')
        else:
            regions.append('Unassigned')
    casesUS.columns      = regions
    casesUS              = casesUS.groupby(casesUS.columns, axis=1).sum()
    casesUS[TOTAL_US_NAME] = casesUS.loc[:, casesUS.columns != 'Unassigned'].sum(axis=1)
    casesUS              = casesUS.reindex(sorted(casesUS.columns), axis=1)
    casesUS.index        = pd.to_datetime(casesUS.index)
    return casesUS


def allCases(cases, includeGeoLocation = False):
    cases.columns = cases.columns.droplevel()
    cases         = cases.groupby(cases.columns, axis=1).sum()

    if not includeGeoLocation:
        cases       = utils.computeGlobal(cases)
        cases       = utils.computeCasesOutside( cases,
                                                 [ 'China', '!Global' ],
                                                 '!Outside China' )

    return cases

def _parseBoundary2(cases):
    cases               = cases.T.reset_index()
    casesBoats          = cases[cases['Province/State'].apply(lambda p: any((b in str(p) for b in BOATS)))]

    cases               = cases[~(cases['Province/State'].isin(BOATS) | (cases['Country/Region'].isin(BOATS)))]
    casesUS             = cases[cases['Country/Region'] == 'US'].drop('Country/Region', axis=1)

    casesUSCounties     = casesUS[casesUS['Province/State'].apply(lambda c: _isCounty(c))]
    casesUSStates       = casesUS[casesUS['Province/State'].apply(lambda c: not _isCounty(c))]

    casesUSStates       = casesUSStates.set_index('Province/State').T
    casesUSStates.index = pd.to_datetime(casesUSStates.index)
    casesUSStates       = _resampleByStateUS_mode2(casesUSStates.copy())
    casesUSStates.index = casesUSStates.index.map(lambda s: s.date())

    casesUSRegions       = _resampleByRegionUS_mode2(casesUSStates.copy())
    casesUSRegions.index = casesUSRegions.index.map(lambda s: s.date())

    casesGlobal         = cases[~cases['Province/State'].isin(casesUSCounties['Province/State'])]
    casesGlobal         = casesGlobal.drop('Province/State', axis=1)
    casesGlobal         = casesGlobal.groupby('Country/Region').sum().T
    casesGlobal         = utils.computeGlobal(casesGlobal)
    casesGlobal         = utils.computeCasesOutside(casesGlobal,
                                            ['China', '!Global'],
                                            '!Outside China')
    casesGlobal.index   = pd.to_datetime(casesGlobal.index)
    casesGlobal.index   = casesGlobal.index.map(lambda s: s.date())

    casesUSCounties       = casesUSCounties.set_index('Province/State').T
    casesUSCounties.index = casesUSCounties.index.map(lambda s: s.date())

    casesBoats       = casesBoats.drop('Country/Region', axis=1).set_index('Province/State').T
    casesBoats.index = casesBoats.index.map(lambda s: s.date())
    casesBoats.rename(BOAT_NAMES, axis=1, inplace=True)
    casesBoats       = casesBoats.groupby(casesBoats.columns, axis=1).sum()

    casesGlobal.sort_index(inplace=True)
    casesUSRegions.sort_index(inplace=True)
    casesUSStates.sort_index(inplace=True)
    casesBoats.sort_index(inplace=True)

    output = {
                'casesGlobal':    casesGlobal,
                'casesUSRegions': casesUSRegions,
                'casesUSStates':  casesUSStates,
                'casesBoats':     casesBoats,
                # 'casesUSCounties': casesUSCounties  # Not implemented
             }
    return output

def makeUSRegionsVerbose(stateCodes, regionsUS = US_REGIONS):
    regionsUSVerbose = {}
    for key in US_REGIONS:
        regionsUSVerbose[key] = []
        for postCode in regionsUS[key]:
            stateName = stateCodes[stateCodes['postalCode'] == postCode].values[0][0]
            regionsUSVerbose[key].append(stateName)
    return regionsUSVerbose

def _resampleByRegionUS_mode2(casesUS):
    stateCodes = pd.read_csv(STATE_CODES_PATH)
    regionsUSVerbose = makeUSRegionsVerbose(stateCodes)
    regions = []
    for state in casesUS.columns:
        regionFound = False
        for region in regionsUSVerbose:
            if state in regionsUSVerbose[region]:
                regions.append(region)
                regionFound = True
                break
        if not regionFound:
            regions.append('Unassigned')

    casesUS.columns      = regions
    casesUS              = casesUS.groupby(casesUS.columns, axis=1).sum()
    casesUS['!Total US'] = casesUS.loc[:, casesUS.columns != 'Unassigned'].sum(axis=1)
    casesUS              = casesUS.reindex(sorted(casesUS.columns), axis=1)
    casesUS.index        = pd.to_datetime(casesUS.index)
    casesUS.sort_index(inplace=True)
    return casesUS


def _getBoats_mode1(cases):
    casesNotBoats = cases.T.reset_index()
    casesNotBoats = casesNotBoats[~(casesNotBoats['Province/State'].isin(BOATS) | (casesNotBoats['Country/Region'].isin(BOATS)))]
    casesNotBoats = casesNotBoats.set_index(['Province/State', 'Country/Region']).T

    casesBoats = cases.loc[:, (BOATS, slice(None))]
    casesBoats.columns = casesBoats.columns.droplevel(level=1)
    casesBoats = casesBoats.groupby(casesBoats.columns, axis=1).sum()
    return casesBoats, casesNotBoats


def _getCounties_mode1(cases):
    casesUS = cases.loc[:, (slice(None), 'US')]
    casesUS = casesUS.T.reset_index()
    casesUS = casesUS[casesUS['Province/State'].apply(lambda c: _isCounty(c))]
    casesUS.drop('Country/Region', axis=1, inplace=True)
    casesUS.set_index('Province/State', inplace=True)
    casesUS = casesUS.T
    casesUS.index = casesUS.index.map(lambda s: s.date())
    return casesUS


def allUSCases(cases):
    casesUS = cases.loc[:, (slice(None), 'US')]
    casesUS.columns = casesUS.columns.droplevel(level=1)

    casesUS.index   = casesUS.index.map(lambda s: s.date())
    casesByStateUS  = _resampleByStateUS_mode1(casesUS.copy())
    casesByRegionUS = _resampleByRegionUS_mode1(casesUS.copy())

    return casesByStateUS, casesByRegionUS



def _readSourceDeprecated(sourceFileName):
    cases = pd.read_csv(sourceFileName)
    cases['Province/State'] = cases['Province/State'].fillna(value='Null')
    for oldName in STATE_NAMES:
        cases['Province/State'] = cases['Province/State'].replace(oldName, STATE_NAMES[oldName])
    cases.drop(labels=['Lat', 'Long'], axis=1, inplace=True)
    cases = cases[~cases['Province/State'].isin(STATE_NAMES_TO_DROP)]
    cases = cases.set_index(['Province/State', 'Country/Region'])
    # Deal with duplicate names by summing columns together
    cases = cases.groupby(['Province/State', 'Country/Region']).sum().T
    cases = cases.rename(COUNTRY_NAMES, axis=1)
    cases.index = pd.to_datetime(cases.index)
    cases.sort_index(inplace=True)
    return cases

def _parseBoundary1(cases):
    casesBoats, casesNotBoats = _getBoats_mode1(cases)
    casesUSStates, casesUSRegions = allUSCases(casesNotBoats)
    casesBoats.sort_index(inplace=True)
    casesNotBoats.sort_index(inplace=True)

    output = {
                'casesGlobal': allCases(casesNotBoats),
                'casesUSRegions': casesUSRegions,
                'casesUSStates': casesUSStates,
                'casesBoats': casesBoats,
                #'casesUSCounties': _getCounties_mode1(casesNotBoats) # Not implemented since JH CSSE stopped supplying US counties
    }
    return output


def _combineCollection(collection):
    cases       = pd.concat(collection)
    cases.index = pd.to_datetime(cases.index)
    cases.index = cases.index.map(lambda s: s.date())
    return cases


def _getReportsToLoadBoundary3(jsCSSEReportPath=JH_CSSE_REPORT_PATH):
    reportsToLoad = []
    for fileName in os.listdir(jsCSSEReportPath):
        if '.csv' in fileName:
            date = pd.to_datetime(fileName.split('.csv')[0], format='%m-%d-%Y').date()
            if date >= pd.to_datetime(PARSING_MODE_BOUNDARY_2, format='%Y-%m-%d').date():
                reportsToLoad.append([fileName, date])
    return reportsToLoad


def _transformReport(report, date):
    report['date'] = date
    report.reset_index(inplace=True)
    report = report.pivot(index='date', columns='Province_State')
    report.columns = report.columns.droplevel(level=0)
    return report


def _parseBoundary3(jsCSSEReportPath=JH_CSSE_REPORT_PATH, targetReportName='Confirmed'):
    reportsToLoad = _getReportsToLoadBoundary3(jsCSSEReportPath=jsCSSEReportPath)

    casesUSStates = []
    for fileName, date in reportsToLoad:
        report = pd.read_csv(os.path.join(jsCSSEReportPath, fileName))
        reportUS = report[report['Country_Region'] == 'US']
        reportUS = reportUS.loc[~(reportUS['Province_State'].isin(BOATS)|reportUS['Country_Region'].isin(BOATS)), :]
        reportUS = reportUS[~reportUS['Province_State'].isin(STATE_NAMES_TO_DROP)]
        reportUSConfirmed = reportUS[['Province_State', targetReportName]].groupby('Province_State').sum()
        reportUSConfirmed = _transformReport(reportUSConfirmed, date)
        casesUSStates.append(reportUSConfirmed)
    casesUSStates = pd.concat(casesUSStates)
    casesUSStates['!Total US'] = casesUSStates.loc[:, casesUSStates.columns != 'Unassigned'].sum(axis=1)

    casesUSStates.sort_index(inplace=True)
    return casesUSStates


def _getCleanCountryNames(casesWithTrueCountries):
    """JH CSSE couldn't decide whether certain territories were countries or not. The function defines the Law."""
    return casesWithTrueCountries.columns


###################################
# TESTS
###################################

from pandas.core.frame import DataFrame
from pandas.core.indexes.datetimes import DatetimeIndex
from datetime import date
import os
import pandas as pd
import re


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

def test_STATE_CODES_PATH():
    assert os.path.exists(STATE_CODES_PATH)


def test_US_REGIONS():
    assert isinstance(US_REGIONS, dict)
    assert isinstance(US_REGIONS['Northeast'], list)


def test_splitCSSEDataByParsingBoundary():
    cases = test__readSourceDeprecated()
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


def test__readSourceDeprecated():
    cases = _readSourceDeprecated(TEST_JH_CSSE_FILE_CONFIRMED_DEPRECATED)
    assert not (cases.columns.droplevel(1).isin(STATE_NAMES.keys())).any()
    assert not (cases.columns.droplevel(1).isin(STATE_NAMES_TO_DROP)).any()
    return cases
