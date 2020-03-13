#!/usr/bin/env python3
# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


import json
import os
import sys

import pandas as pd
import re

from covidvu import utils
from pdb import set_trace

# *** initializations ***

pd.options.mode.chained_assignment = None


# *** constants ***

JH_CSSE_DATA_HOME       = 'COVID-19'
JH_CSSE_PATH            = os.path.join(os.path.join(os.getcwd(), JH_CSSE_DATA_HOME), 'csse_covid_19_data/csse_covid_19_time_series')
JH_CSSE_FILE_CONFIRMED  = os.path.join(JH_CSSE_PATH, 'time_series_19-covid-Confirmed.csv')
JH_CSSE_FILE_DEATHS     = os.path.join(JH_CSSE_PATH, 'time_series_19-covid-Deaths.csv')
JH_CSSE_FILE_RECOVERED  = os.path.join(JH_CSSE_PATH, 'time_series_19-covid-Recovered.csv')
SITE_DATA               = './site-data'
STATE_CODES_PATH        = os.path.join(os.getcwd(), 'stateCodesUS.csv')
PARSING_MODE_BOUNDARY_1 = '2020-03-10'  # From this date (inclusive), new parsing rules


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
    'U.S. TOTAL': '!Total US',
    'Alabama': 'South',
    'Alaska': 'West',
    'Arizona': 'West',
    'Arkansas': 'South',
    'California': 'West',
    'Colorado': 'West',
    'Connecticut': 'Northeast',
    'Delaware': 'South',
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
    'Utah': 'West',
    'Vermont': 'Northeast',
    'Virginia': 'South',
    'Washington D.C.': 'South',
    'Washington': 'West',
    'West Virginia': 'South',
    'Wisconsin': 'Midwest',
    'Wyoming': 'West',
}


BOATS = ('Diamond Princess',
         'Grand Princess',
        )

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

    cases = (cases.loc[cases.index  < PARSING_MODE_BOUNDARY_1],
             cases.loc[cases.index >= PARSING_MODE_BOUNDARY_1])

    return cases

def splitCSSEData(cases):
    cases = cases.T.reset_index()
    casesBoats = cases[cases['Province/State'].apply(lambda p: any((b in str(p) for b in BOATS)))]

    cases = cases[~cases['Province/State'].isin(BOATS)]
    casesUS = cases[cases['Country/Region'] == 'US'].drop('Country/Region', axis=1)

    casesUSCounties = casesUS[casesUS['Province/State'].apply(lambda c: _isCounty(c))]
    casesUSStates = casesUS[casesUS['Province/State'].apply(lambda c: not _isCounty(c))]

    casesUSStates = casesUSStates.set_index('Province/State').T
    casesUSStates.index = pd.to_datetime(casesUSStates.index)
    casesUSStates = _resampleByStateUS_mode2(casesUSStates.copy())

    casesUSRegions = _resampleByRegionUS_mode2(casesUSStates.copy())


    casesGlobal = cases[~cases['Province/State'].isin(casesUSCounties['Province/State'])]
    casesGlobal = casesGlobal.drop('Province/State', axis=1)
    casesGlobal = casesGlobal.groupby('Country/Region').sum().T
    casesGlobal = utils.computeGlobal(casesGlobal)
    casesGlobal = utils.computeCasesOutside(casesGlobal,
                                            ['China', '!Global'],
                                            '!Outside China')

    casesUSCounties = casesUSCounties.set_index('Province/State').T
    casesUSCounties.index = casesUSCounties.index.map(lambda s: s.date())

    casesBoats = casesBoats.drop('Country/Region', axis=1).set_index('Province/State').T



    return casesGlobal, casesUSRegions, casesUSStates, casesUSCounties, casesBoats


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


def _dumpJSON(cases, target):
    with open(target, 'w') as outputJSON:
        json.dump(cases, outputJSON, ensure_ascii = False)


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
        _dumpJSON(result, target)

    return result


def dumpUSCasesAsJSONFor(cases, target = None, scope = 'US', indent = 2):
    keys        = cases.keys()
    cases.index = cases.index.map(lambda s: s.strftime('%Y-%m-%d'))
    result      = cases[keys].to_dict()
    target      = target.replace('.json', '-%s.json' % scope)

    if target:
        _dumpJSON(result, target)

    return result


def _main(target):
    if 'confirmed' == target:
        sourceFileName = JH_CSSE_FILE_CONFIRMED
    elif 'deaths' == target:
        sourceFileName = JH_CSSE_FILE_DEATHS
    elif 'recovered' == target:
        sourceFileName = JH_CSSE_FILE_RECOVERED
    else:
        raise NotImplementedError

    casesGlobalCollection = [0, 0]
    casesUSStatesCollection = [0, 0]
    casesUSRegionsCollection = [0, 0]
    casesUSCountiesCollection = [0, 0]
    casesBoatsCollection = [0, 0]

    cases = pd.read_csv(sourceFileName)

    for oldName in STATE_NAMES:
        cases['Province/State'] = cases['Province/State'].replace(oldName, STATE_NAMES[oldName])

    cases = splitCSSEDataByParsingBoundary(cases)

    # Parsing type 1
    casesUS,  casesUSRegions = allUSCases(cases[0])
    casesUSCounties = _getCounties_mode1(cases[0])

    casesGlobalCollection[0] = allCases(cases[0])
    casesUSRegionsCollection[0] = casesUSRegions
    casesUSStatesCollection[0] = casesUS
    casesUSCountiesCollection[0] = casesUSCounties
    #casesBoatsCollection[0] =

    # Parsing type 2
    casesGlobal2, casesUSRegions2, casesUSStates2, casesUSCounties2, casesBoats2 = splitCSSEData(cases[1])

    casesGlobalCollection[1] = casesGlobal2
    casesUSRegionsCollection[1] = casesUSRegions2
    casesUSStatesCollection[1] = casesUSStates2
    casesUSCountiesCollection[1] = casesUSCounties2

    # Concatenate
    casesGlobal = pd.concat(casesGlobalCollection)
    casesUSRegions = pd.concat(casesUSRegionsCollection)

    casesUSStates = pd.concat(casesUSStatesCollection)
    casesUSCounties = pd.concat(casesUSCountiesCollection)

    casesGlobal   = casesGlobal.fillna(method='ffill', axis=0).fillna(0)
    casesUSStates = casesUSStates.fillna(method='ffill', axis=0).fillna(0)


    outputFileName = os.path.join(SITE_DATA, target+'.json')
    dumpGlobalCasesAsJSONFor(casesGlobal, outputFileName)
    dumpUSCasesAsJSONFor(casesUSRegions, outputFileName, 'US-Regions')
    dumpUSCasesAsJSONFor(casesUSStates, outputFileName)
    #dumpUSCasesAsJSONFor(casesUSCounties, outputFileName, 'US-Counties')


    return casesGlobal, casesUSRegions, casesUSStates #, casesUSCounties

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
        _main(argument)

