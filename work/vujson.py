#!/usr/bin/env python3
# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


import json
import os
import sys

import pandas as pd
import re

import utils


# *** initializations ***

pd.options.mode.chained_assignment = None


# *** constants ***

JH_CSSE_DATA_HOME      = 'COVID-19'
JH_CSSE_PATH           = os.path.join(os.path.join(os.getcwd(), JH_CSSE_DATA_HOME), 'csse_covid_19_data/csse_covid_19_time_series')
JH_CSSE_FILE_CONFIRMED = os.path.join(JH_CSSE_PATH, 'time_series_19-covid-Confirmed.csv')
JH_CSSE_FILE_DEATHS    = os.path.join(JH_CSSE_PATH, 'time_series_19-covid-Deaths.csv')
JH_CSSE_FILE_RECOVERED = os.path.join(JH_CSSE_PATH, 'time_series_19-covid-Recovered.csv')
STATE_CODES_PATH       = os.path.join(os.getcwd(), 'stateCodesUS.csv')

US_REGIONS = {
    'Northeast': sorted([ 'CT', 'ME', 'MA', 'NH', 'RI', 'VT', 'NJ', 'NY', 'PA', ]),
    'Midwest': sorted([ 'IL', 'IN', 'MI', 'OH', 'WI', 'IA', 'KS', 'MN', 'MO', 'NE', 'ND', 'SD', ]),
    'South': sorted([ 'DE', 'GA', 'FL', 'MD', 'NC', 'SC', 'VA', 'DC', 'WV', 'AL', 'KY', 'MS', 'TN', 'AR', 'LA', 'OK', 'TX', ]),
    'West': sorted([ 'AZ', 'CO', 'ID', 'MT', 'NV', 'NM', 'UT', 'WY', 'AK', 'CA', 'HI', 'OR', 'WA', ] ),
}


# *** functions ***

def allCases(fileName = JH_CSSE_FILE_CONFIRMED, includeGeoLocation = False):
    cases = pd.read_csv(fileName).groupby(['Country/Region']).sum().T

    if not includeGeoLocation:
        cases       = cases.iloc[2:]
        cases.index = pd.to_datetime(cases.index)
        cases       = utils.computeGlobal(cases)
        cases       = utils.computeCasesOutside( cases,
                                                 [ 'Mainland China', '!Global' ],
                                                 '!Outside Mainland China' )

    return cases


def _resampleByStateUS(casesUS):
    states     = []
    stateCodes = pd.read_csv(STATE_CODES_PATH)
    for province in casesUS.columns:
        match = re.search(r', ([A-Z][A-Z])', province)
        if match:
            postalCode = match.groups()[0]
            code       = stateCodes[stateCodes['postalCode'] == postalCode]
            assert code.shape[0] == 1
            states.append(code['state'].iloc[0])
        elif 'Diamond Princess' in province:
            states.append('Diamond Princess')
        else:
            states.append('Unassigned')

    casesUS.columns      = states
    casesUS              = casesUS.groupby(casesUS.columns, axis=1).sum()

    statesWithoutCases   = stateCodes[~stateCodes['state'].isin(casesUS.columns)]['state']
    for stateName in statesWithoutCases:
        casesUS[stateName] = 0

    casesUS['!Total US'] = casesUS.sum(axis=1)
    casesUS              = casesUS.reindex(sorted(casesUS.columns), axis=1)
    return casesUS


def _resampleByRegionUS(casesUS):
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
                raise ValueError(f'{postalCode} not found in US_REGIONS')
        elif 'Diamond Princess' in province:
            regions.append('Diamond Princess')
        else:
            regions.append('Unassigned')
    casesUS.columns      = regions
    casesUS              = casesUS.groupby(casesUS.columns, axis=1).sum()
    casesUS['!Total US'] = casesUS.sum(axis=1)
    casesUS              = casesUS.reindex(sorted(casesUS.columns), axis=1)
    return casesUS


def allUSCases(fileName = JH_CSSE_FILE_CONFIRMED):
    cases = pd.read_csv(fileName)
    
    casesUS         = cases[cases['Country/Region']=='US'].drop('Country/Region', axis=1).set_index('Province/State').T
    casesUS         = casesUS.iloc[2:]
    casesUS.index   = pd.to_datetime(casesUS.index)
    casesUS.index   = casesUS.index.map(lambda s: s.date())
    casesByStateUS  = _resampleByStateUS(casesUS.copy())
    casesByRegionUS = _resampleByRegionUS(casesUS.copy())

    return casesByStateUS, casesByRegionUS


def _dumpJSON(cases, target):
    with open(target, 'w') as outputJSON:
        json.dump(cases, outputJSON)


def dumpGlobalCasesAsJSONFor(cases, target = None, indent = 2):
    """
        cases:  dataframe output from the allCases() function; confirmed,
                deaths, recovered
        target: string or file stream; if None, return a JSON string
    """
    dataSource = cases.transpose()
    keys       = dataSource.keys()
    result     = dataSource[keys].iloc[:].to_json(orient = 'table',
                                                  indent = indent)

    # TODO: https://github.com/pr3d4t0r/COVIDvu/issues/33
    result = json.loads(result)['data']

    if target:
        _dumpJSON(result, target)

    return result


def dumpUSCasesAsJSONFor(cases, target = None, scope = 'US', indent = 2):
    keys        = cases.keys()
    cases.index = cases.index.map(lambda s: s.strftime('%m/%d/%Y'))
    result    = cases[keys].to_dict()
    target    = target.replace('.json', '-%s.json' % scope)

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

    casesUS, \
    casesUSRegions = allUSCases(sourceFileName)
    outputFileName = target+'.json'

    dumpGlobalCasesAsJSONFor(allCases(sourceFileName, includeGeoLocation = True), outputFileName)
    dumpUSCasesAsJSONFor(casesUS, outputFileName)
    dumpUSCasesAsJSONFor(casesUSRegions, outputFileName, 'US-Regions')


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

