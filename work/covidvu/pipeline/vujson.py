#!/usr/bin/env python3
# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


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

# -- 20200325 - CSSE broke this again:
JH_CSSE_ARCHIVED_PATH              = os.path.join(os.path.join(os.getcwd(), JH_CSSE_DATA_HOME), 'archived_data/archived_time_series')
JH_CSSE_FILE_CONFIRMED_DEPRECATED  = os.path.join(JH_CSSE_ARCHIVED_PATH, 'time_series_19-covid-Confirmed_archived_0325.csv')
JH_CSSE_FILE_DEATHS_DEPRECATED     = os.path.join(JH_CSSE_ARCHIVED_PATH, 'time_series_19-covid-Deaths_archived_0325.csv')
JH_CSSE_FILE_RECOVERED_DEPRECATED  = os.path.join(JH_CSSE_ARCHIVED_PATH, 'time_series_19-covid-Recovered_archived_0325.csv')

JH_CSSE_PATH                       = os.path.join(os.path.join(os.getcwd(), JH_CSSE_DATA_HOME), 'csse_covid_19_data/csse_covid_19_time_series')
JH_CSSE_FILE_CONFIRMED             = os.path.join(JH_CSSE_PATH, 'time_series_covid19_confirmed_global.csv')
JH_CSSE_FILE_DEATHS                = os.path.join(JH_CSSE_PATH, 'time_series_covid19_deaths_global.csv')

JH_CSSE_REPORT_PATH                = os.path.join(os.path.join(os.getcwd(), JH_CSSE_DATA_HOME), 'csse_covid_19_data/csse_covid_19_daily_reports')

SITE_DATA                          = './site-data'
STATE_CODES_PATH                   = os.path.join(os.getcwd(), 'stateCodesUS.csv')

PARSING_MODE_BOUNDARY_1            = '2020-03-10'  # From this date (inclusive), new parsing rules
PARSING_MODE_BOUNDARY_2            = '2020-03-24'  # From this date (inclusive), new parsing rules



US_REGIONS = {
    'Northeast': sorted([ 'CT', 'ME', 'MA', 'NH', 'RI', 'VT', 'NJ', 'NY', 'PA', ]),
    'Midwest': sorted([ 'IL', 'IN', 'MI', 'OH', 'WI', 'IA', 'KS', 'MN', 'MO', 'NE', 'ND', 'SD', ]),
    'South': sorted([ 'DE', 'GA', 'FL', 'MD', 'NC', 'SC', 'VA', 'DC', 'WV', 'AL', 'KY', 'MS', 'TN', 'AR', 'LA', 'OK', 'TX', ]),
    'West': sorted([ 'AZ', 'CO', 'ID', 'MT', 'NV', 'NM', 'UT', 'WY', 'AK', 'CA', 'HI', 'OR', 'WA', ] ),
}


def makeUSRegionsVerbose(stateCodes, regionsUS = US_REGIONS):
    regionsUSVerbose = {}
    for key in US_REGIONS:
        regionsUSVerbose[key] = []
        for postCode in regionsUS[key]:
            stateName = stateCodes[stateCodes['postalCode'] == postCode].values[0][0]
            regionsUSVerbose[key].append(stateName)
    return regionsUSVerbose


US_REGIONS_LONG = {
    '!Total US': '!Total US',
    'Alabama': 'South',
    'Alaska': 'West',
    'American Samoa': 'Other',
    'Arizona': 'West',
    'Arkansas': 'South',
    'California': 'West',
    'Colorado': 'West',
    'Connecticut': 'Northeast',
    'Delaware': 'South',
    'District of Columbia': 'South',
    'Florida': 'South',
    'Georgia': 'South',
    'Grand Princess': 'Grand Princess',
    'Hawaii': 'West',
    'Idaho': 'West',
    'Illinois': 'Midwest',
    'Indiana': 'Midwest',
    'Iowa': 'Midwest',
    'Kansas': 'Midwest',
    'Kentucky': 'South',
    'Louisiana': 'South',
    'Maine': 'Northeast',
    'Maryland': 'Northeast',
    'Massachusetts': 'Northeast',
    'Michigan': 'Midwest',
    'Minnesota': 'Midwest',
    'Mississippi': 'Midwest',
    'Missouri': 'South',
    'Montana': 'Midwest',
    'Nebraska': 'Midwest',
    'Nevada': 'West',
    'New Hampshire': 'Northeast',
    'New Jersey': 'Northeast',
    'New Mexico': 'West',
    'New York': 'Northeast',
    'North Carolina': 'South',
    'North Dakota': 'Midwest',
    'Ohio': 'Midwest',
    'Oklahoma': 'Midwest',
    'Oregon': 'West',
    'Pennsylvania': 'Northeast',
    'Rhode Island': 'Northeast',
    'South Carolina': 'South',
    'South Dakota': 'Midwest',
    'Tennessee': 'South',
    'Texas': 'TX',
    'U.S. TOTAL': '!Total US',
    'Utah': 'West',
    'Vermont': 'Northeast',
    'Virginia': 'South',
    'Washington D.C.': 'South',
    'Washington': 'West',
    'West Virginia': 'South',
    'Wisconsin': 'Midwest',
    'Wyoming': 'West',
    'Guam': 'Other',
    'Marshall Islands': 'Other',
    'Micronesia': 'Other',
    'Northern Mariana Islands': 'Other',
    'Palau': 'Other',
    'Puerto Rico': 'Other',
    'Virgin Islands': 'Other',
}


BOATS = (
         'Diamond Princess',
         'Grand Princess',
        )

BOAT_NAMES = {
                'From Diamond Princess': 'Diamond Princess',
             }

COUNTRY_NAMES = {
                    'Mainland China': 'China',
                }

STATE_NAMES = {
                    'Washington, D.C.': 'Washington D.C.',
                }


# *** functions ***
def _isCounty(c):
    if re.search(r", [A-Z][A-Z]", c):
        return True
    else:
        return False

def _orderAxes(df):
    df = df.reindex(sorted(df.columns), axis=1)
    df.index = pd.to_datetime(df.index)

def splitCSSEDataByParsingBoundary(cases):
    cases.drop(labels=['Lat', 'Long'], axis=1, inplace=True)
    cases = cases.set_index(['Province/State', 'Country/Region']).T
    cases = cases.rename(COUNTRY_NAMES, axis=1)

    cases.index = pd.to_datetime(cases.index)

    cases = [cases.loc[cases.index  < PARSING_MODE_BOUNDARY_1],
             cases.loc[cases.index >= PARSING_MODE_BOUNDARY_1]]

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

    output = {
                'casesGlobal':    casesGlobal,
                'casesUSRegions': casesUSRegions,
                'casesUSStates':  casesUSStates,
                'casesBoats':     casesBoats,
                # 'casesUSCounties': casesUSCounties  # Not implemented
             }
    return output

def _parseBoundary3Global(sourceFileName):
    cases = pd.read_csv(sourceFileName)
    cases.drop(labels=['Lat', 'Long'], axis=1, inplace=True)
    cases = cases.set_index(['Province/State', 'Country/Region']).T
    cases.index = pd.to_datetime(cases.index)
    cases.index = cases.index.map(lambda t: t.date())

    cases = cases[cases.index >= pd.to_datetime(PARSING_MODE_BOUNDARY_2)]

    cases = cases.T.reset_index()

    casesBoats = cases[cases['Province/State'].apply(lambda p: any((b in str(p) for b in BOATS)))]
    casesBoats.rename(BOAT_NAMES, axis=1, inplace=True)
    casesBoats = casesBoats.groupby(casesBoats.columns, axis=1).sum()
    casesBoats.drop('Country/Region', axis=1, inplace=True)
    casesBoats = casesBoats.set_index('Province/State').T

    casesGlobal = cases[~(cases['Province/State'].isin(BOATS)|(cases['Country/Region'].isin(BOATS)))]

    casesGlobal.drop('Province/State', axis=1, inplace=True)
    casesGlobal = casesGlobal.groupby('Country/Region').sum().T

    casesGlobal = utils.computeGlobal(casesGlobal)
    casesGlobal = utils.computeCasesOutside(casesGlobal,
                                      ['China', '!Global'],
                                      '!Outside China')
    return casesGlobal, casesBoats


def allCases(cases, includeGeoLocation = False):
    cases.columns = cases.columns.droplevel()
    cases         = cases.groupby(cases.columns, axis=1).sum()

    if not includeGeoLocation:
        cases       = utils.computeGlobal(cases)
        cases       = utils.computeCasesOutside( cases,
                                                 [ 'China', '!Global' ],
                                                 '!Outside China' )

    return cases

def _resampleByStateUS_mode2(casesUS):
    stateCodes = pd.read_csv(STATE_CODES_PATH)

    statesWithoutCases   = stateCodes[~stateCodes['state'].isin(casesUS.columns)]['state']
    for stateName in statesWithoutCases:
        casesUS[stateName] = 0

    casesUS['!Total US'] = casesUS.loc[:, casesUS.columns != 'Unassigned'].sum(axis=1)
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

    casesUS['!Total US'] = casesUS.loc[:, casesUS.columns != 'Unassigned'].sum(axis=1)
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
    casesUS['!Total US'] = casesUS.loc[:, casesUS.columns != 'Unassigned'].sum(axis=1)
    casesUS              = casesUS.reindex(sorted(casesUS.columns), axis=1)
    casesUS.index        = pd.to_datetime(casesUS.index)
    return casesUS


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


def dumpJSON(outputDict, target):
    with open(target, 'w') as outputJSON:
        json.dump(outputDict, outputJSON, ensure_ascii = False)


def dumpGlobalCasesAsJSONFor(cases, target = None, indent = 2):
    """
        cases:  dataframe output from the allCases() function; confirmed,
                deaths, recovered
        target: string or file stream; if None, return a JSON string
    """
    keys        = cases.keys()
    cases.index = cases.index.map(lambda s: s.strftime('%Y-%m-%d'))
    result      = cases[keys].to_dict()

    if target:
        dumpJSON(result, target)

    return result


def dumpUSCasesAsJSONFor(cases, target = None, scope = 'US', indent = 2):
    keys        = cases.keys()
    cases.index = cases.index.map(lambda s: s.strftime('%Y-%m-%d'))
    result      = cases[keys].to_dict()
    target      = target.replace('.json', '-%s.json' % scope)

    if target:
        dumpJSON(result, target)

    return result


def resolveReportFileName(siteDataDirectory, report, region):
    return os.path.join(siteDataDirectory, report+('%s.json' % region))


def _readSourceDeprecated(sourceFileName):
    cases = pd.read_csv(sourceFileName)
    for oldName in STATE_NAMES:
        cases['Province/State'] = cases['Province/State'].replace(oldName, STATE_NAMES[oldName])
    return cases

def _parseBoundary1(cases):
    casesBoats, casesNotBoats = _getBoats_mode1(cases)
    casesUSStates, casesUSRegions = allUSCases(casesNotBoats)

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
        reportUSConfirmed = reportUS[['Province_State', targetReportName]].groupby('Province_State').sum()
        reportUSConfirmed = _transformReport(reportUSConfirmed, date)
        casesUSStates.append(reportUSConfirmed)
    casesUSStates = pd.concat(casesUSStates)
    casesUSStates['!Total US'] = casesUSStates.loc[:, casesUSStates.columns != 'Unassigned'].sum(axis=1)
    return casesUSStates


def _getCleanCountryNames(casesWithTrueCountries):
    """JH CSSE couldn't decide whether certain territories were countries or not. The function defines the Law."""
    return casesWithTrueCountries.columns


def parseCSSE(target,
              siteData=SITE_DATA,
              jhCSSEFileConfirmed           = JH_CSSE_FILE_CONFIRMED,
              jhCSSEFileDeaths              = JH_CSSE_FILE_DEATHS,
              jhCSSEFileConfirmedDeprecated = JH_CSSE_FILE_CONFIRMED_DEPRECATED,
              jhCSSEFileDeathsDeprecated    = JH_CSSE_FILE_DEATHS_DEPRECATED,
              jhCSSEFileRecoveredDeprecated = JH_CSSE_FILE_RECOVERED_DEPRECATED,
              jsCSSEReportPath              = JH_CSSE_REPORT_PATH,
              ):
    if 'confirmed' == target:
        sourceFileNameDeprecated = jhCSSEFileConfirmedDeprecated
        sourceFileName           = jhCSSEFileConfirmed
        targetReportName         = 'Confirmed'
    elif 'deaths' == target:
        sourceFileNameDeprecated = jhCSSEFileDeathsDeprecated
        sourceFileName           = jhCSSEFileDeaths
        targetReportName         = 'Deaths'
    elif 'recovered' == target:
        sourceFileNameDeprecated = jhCSSEFileRecoveredDeprecated  # Recovered deprecated after 2020-03-24
        targetReportName         = 'Recovered'
    else:
        raise NotImplementedError

    casesGlobalCollection    = [0, 0, 0]
    casesUSStatesCollection  = [0, 0, 0]
    casesUSRegionsCollection = [0, 0, 0]
    casesBoatsCollection     = [0, 0, 0]

    casesDeprecated = _readSourceDeprecated(sourceFileNameDeprecated)

    casesDeprecated = splitCSSEDataByParsingBoundary(casesDeprecated)

    # Parsing type 1 -- before 2020-03-10
    outputBoundary1             = _parseBoundary1(casesDeprecated[0])
    casesGlobalCollection[0]    = outputBoundary1['casesGlobal']
    casesUSStatesCollection[0]  = outputBoundary1['casesUSStates']
    casesUSRegionsCollection[0] = outputBoundary1['casesUSRegions']
    casesBoatsCollection[0]     = outputBoundary1['casesBoats']

    # Parsing type 2 -- after 2020-03-10
    outputBoundary2             = _parseBoundary2(casesDeprecated[1])
    casesGlobalCollection[1]    = outputBoundary2['casesGlobal']
    casesUSRegionsCollection[1] = outputBoundary2['casesUSRegions']
    casesUSStatesCollection[1]  = outputBoundary2['casesUSStates']
    casesBoatsCollection[1]     = outputBoundary2['casesBoats']


    # Parsing type 3 -- on/after 2020-03-24
    casesGlobal3, casesBoats3     = _parseBoundary3Global(sourceFileName)
    casesUSStates3               = _parseBoundary3(jsCSSEReportPath=jsCSSEReportPath, targetReportName=targetReportName)
    casesUSRegions3              = _resampleByRegionUS_mode2(casesUSStates3.copy())
    casesGlobalCollection[2]    = casesGlobal3
    casesUSRegionsCollection[2] = casesUSRegions3
    casesUSStatesCollection[2]  = casesUSStates3
    casesBoatsCollection[2]     = casesBoats3


    # Concatenate
    casesGlobal     = _combineCollection(casesGlobalCollection)
    casesUSRegions  = _combineCollection(casesUSRegionsCollection)
    casesUSStates   = _combineCollection(casesUSStatesCollection)
    casesBoats      = _combineCollection(casesBoatsCollection)

    # Kludges: JA20200325
    countryNamesClean = _getCleanCountryNames(casesGlobal3)
    casesGlobal['!Global'] = casesGlobal['!Global'] - casesGlobal.loc[:, ~casesGlobal.columns.isin(countryNamesClean)].sum(axis=1)
    casesGlobal['!Outside China'] = casesGlobal['!Outside China'] - casesGlobal.loc[:, ~casesGlobal.columns.isin(countryNamesClean)].sum(
        axis=1)
    casesGlobal = casesGlobal[countryNamesClean]


    casesGlobal     = casesGlobal.fillna(value=0, axis=0).fillna(0)
    casesUSStates   = casesUSStates.fillna(value=0, axis=0).fillna(0)
    casesUSRegions  = casesUSRegions.fillna(value=0, axis=0).fillna(0)
    casesBoats      = casesBoats.fillna(value=0, axis=0).fillna(0)

    output = {
        'casesGlobal': casesGlobal,
        'casesUSRegions': casesUSRegions,
        'casesUSStates': casesUSStates,
        'casesBoats': casesBoats,
        # 'casesUSCounties': casesUSCounties  # Not Implemented
    }

    outputFileName = resolveReportFileName(siteData, target, '')
    dumpGlobalCasesAsJSONFor(casesGlobal.copy(), outputFileName)
    dumpUSCasesAsJSONFor(casesUSRegions.copy(), outputFileName, 'US-Regions')
    dumpUSCasesAsJSONFor(casesUSStates.copy(), outputFileName)
    dumpUSCasesAsJSONFor(casesBoats.copy(), outputFileName, 'boats')
    #dumpUSCasesAsJSONFor(casesUSCounties.copy(), outputFileName, 'US-Counties')
    return output

# *** main ***

if '__main__' == __name__:
    # TODO: Parse command line for real?  Decide.
    #
    # Usage:  vujson.py casetype
    #         where castype is one or more of:
    #
    #         - confirmed
    #         - deaths
    #         - recovered

    for argument in sys.argv[1:]:
        _ = parseCSSE(argument)

