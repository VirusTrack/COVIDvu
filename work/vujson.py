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
    states = []
    stateCodes = pd.read_csv('stateCodesUS.csv')
    for region in casesUS.columns:
        try:
            postalCode = re.search(r', ([A-Z][A-Z])', region).groups()[0]
            code = stateCodes[stateCodes['postalCode'] == postalCode]
            assert code.shape[0] == 1
            states.append(code['state'].iloc[0])
        except AttributeError:
            states.append('Unassigned')
    casesUS.columns = states
    casesUS = casesUS.groupby(casesUS.columns, axis=1).sum()
    return casesUS


def allUSCases(fileName = JH_CSSE_FILE_CONFIRMED):
    cases = pd.read_csv(JH_CSSE_FILE_CONFIRMED)
    
    casesUS = cases[cases['Country/Region']=='US'].drop('Country/Region', axis=1).set_index('Province/State').T
    casesUS = casesUS.iloc[2:]
    casesUS.index = pd.to_datetime(casesUS.index)
    casesUS = _resampleByStateUS(casesUS)
    casesUS['!Total US'] = casesUS.sum(axis = 1)
    casesUS.columns = [c.lstrip() for c in casesUS.columns]
    casesUS = casesUS.reindex(sorted(casesUS.columns), axis = 1)

    return casesUS
    

def dumpDataSourceAsJSONFor(cases, target = None, indent = 2):
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
        with open(target, 'w') as outputJSON:
            json.dump(result, outputJSON)

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

    outputFileName = target+'.json'

    dumpDataSourceAsJSONFor(allCases(sourceFileName, includeGeoLocation = True), outputFileName)


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

