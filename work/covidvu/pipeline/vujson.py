#!/usr/bin/env python3
# See: https://github.com/VirusTrack/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


from covidvu import utils
from covidvu.virustrack.countryinfo import TOTAL_US_NAME
from covidvu.virustrack.countryinfo import US_REGIONS

import json
import numpy as np
import os
import pandas as pd
import sys


# *** initializations ***

pd.options.mode.chained_assignment = None


# *** constants ***

JH_CSSE_DATA_HOME         = 'COVID-19'
JH_CSSE_PATH              = os.path.join(os.path.join(os.getcwd(), JH_CSSE_DATA_HOME), 'csse_covid_19_data/csse_covid_19_time_series')

JH_CSSE_FILE_CONFIRMED    = os.path.join(JH_CSSE_PATH, 'time_series_covid19_confirmed_global.csv')
JH_CSSE_FILE_DEATHS       = os.path.join(JH_CSSE_PATH, 'time_series_covid19_deaths_global.csv')
JH_CSSE_FILE_CONFIRMED_US = os.path.join(JH_CSSE_PATH, 'time_series_covid19_confirmed_US.csv')
JH_CSSE_FILE_DEATHS_US    = os.path.join(JH_CSSE_PATH, 'time_series_covid19_deaths_US.csv')

SITE_DATA                 = './site-data'

BOATS = (
         'Diamond Princess',
         'Grand Princess',
        )


COUNTY_NAMES_US  = {
                    'Northern Mariana Islands': 'Marianas',
                }

LABELS_TO_DROP = ['UID', 'code3', 'FIPS', 'Lat', 'Long_', 'Combined_Key', 'iso2', 'iso3', 'Country_Region']

# *** functions ***

def _parseGlobal(sourceFileName):
    """Parse JH CSSE's most up to date data for countries and boats"""
    cases = pd.read_csv(sourceFileName)
    cases.drop(labels=['Lat', 'Long'], axis=1, inplace=True)
    cases = cases.set_index(['Province/State', 'Country/Region']).T
    cases.index = pd.to_datetime(cases.index)
    cases.index = cases.index.map(lambda t: t.date())

    cases = cases.T.reset_index()

    casesBoats = cases[cases['Province/State'].apply(lambda p: any((b in str(p) for b in BOATS)))]
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

    casesGlobal.sort_index(inplace=True)
    casesBoats.sort_index(inplace=True)
    return casesGlobal, casesBoats


def _resampleByRegionUS(casesUS, regionsUS = US_REGIONS):
    regions = []
    casesUS.drop(TOTAL_US_NAME, axis=1, inplace=True)
    for state in casesUS.columns:
        if state in regionsUS:
            regions.append(regionsUS[state])
        else:
            raise ValueError(f'{state} not in known states')

    casesUS.columns        = regions
    casesUS                = casesUS.groupby(casesUS.columns, axis=1).sum()
    casesUS[TOTAL_US_NAME] = casesUS.sum(axis=1)
    casesUS                = casesUS.reindex(sorted(casesUS.columns), axis=1)
    casesUS.index          = pd.to_datetime(casesUS.index)
    casesUS.sort_index(inplace=True)
    return casesUS


def dumpJSON(outputDict, target):
    with open(target, 'w') as outputJSON:
        json.dump(outputDict, outputJSON, ensure_ascii = False)


def dumpGlobalCasesAsJSONFor(cases, target = None):
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


def dumpUSCasesAsJSONFor(cases, target = None, scope = 'US'):
    keys        = cases.keys()
    cases.index = cases.index.map(lambda s: s.strftime('%Y-%m-%d'))
    result      = cases[keys].to_dict()
    target      = target.replace('.json', '-%s.json' % scope)

    if target:
        dumpJSON(result, target)

    return result


def dumpUSCountiesAsJSONFor(cases, target = None, scope = 'US-Counties'):
    cases.index = cases.index.map(lambda s: s.strftime('%Y-%m-%d'))
    result = {}
    for n, ts in cases.iteritems():
        countyName, stateName = n
        if isinstance(countyName, float):
            if np.isnan(countyName):
                continue
        result[countyName] = {stateName: ts.to_dict()}
    target = target.replace('.json', '-%s.json' % scope)
    if target:
        dumpJSON(result, target)
    return target


def resolveReportFileName(siteDataDirectory, report, region):
    return os.path.join(siteDataDirectory, report+('%s.json' % region))


def _getStateCounts(cases, target):
    if target == 'deaths':
        cases = cases.drop(labels=LABELS_TO_DROP + ['Admin2','Population'],
                           axis=1)
    elif target == 'confirmed':
        cases = cases.drop(labels=LABELS_TO_DROP + ['Admin2'],
                           axis=1)
    cases = cases.set_index('Province_State')
    cases = cases.T
    cases.index = pd.to_datetime(cases.index, format='%m/%d/%y')
    cases = cases.groupby(axis=1, level=0).sum()
    cases = cases.sort_index()
    return cases


def _getCountyCounts(cases, target):
    if target == 'deaths':
        cases = cases.drop(labels=LABELS_TO_DROP + ['Population'],
                           axis=1)
    elif target == 'confirmed':
        cases = cases.drop(labels=LABELS_TO_DROP,
                           axis=1)
    cases = cases.set_index(['Admin2','Province_State'])
    cases = cases.T
    cases.index = pd.to_datetime(cases.index, format='%m/%d/%y')
    cases = cases.sort_index()
    return cases


def _renameCounties(countyName, countyRemapping = COUNTY_NAMES_US):
    if countyName in countyRemapping:
        return countyRemapping[countyName]
    else:
        return countyName


def parseCSSE(target,
              siteData              = SITE_DATA,
              jhCSSEFileConfirmed   = JH_CSSE_FILE_CONFIRMED,
              jhCSSEFileDeaths      = JH_CSSE_FILE_DEATHS,
              jhCSSEFileConfirmedUS = JH_CSSE_FILE_CONFIRMED_US,
              jhCSSEFileDeathsUS    = JH_CSSE_FILE_DEATHS_US,
              ):
    if 'confirmed' == target:
        sourceFileName   = jhCSSEFileConfirmed
        sourceFileNameUS = jhCSSEFileConfirmedUS
    elif 'deaths' == target:
        sourceFileName   = jhCSSEFileDeaths
        sourceFileNameUS = jhCSSEFileDeathsUS
    else:
        raise NotImplementedError

    # Current, up-to-date, version of JH CSSE for countries
    casesGlobal, casesBoats = _parseGlobal(sourceFileName)

    casesUS = pd.read_csv(sourceFileNameUS)
    casesUS['Province_State'] = casesUS['Province_State'].map(lambda c: _renameCounties(c))

    casesBoats = casesUS[casesUS['Province_State'].isin(BOATS)]
    casesNoBoats = casesUS[~casesUS['Province_State'].isin(BOATS)]
    casesBoats = _getStateCounts(casesBoats, target)
    casesUSStates = _getStateCounts(casesNoBoats.copy(), target)
    casesUSStates[TOTAL_US_NAME] = casesUSStates.sum(axis=1)
    casesUSStates = casesUSStates.reindex(sorted(casesUSStates.columns), axis=1)
    casesUSCounties = _getCountyCounts(casesNoBoats.copy(), target)
    casesUSRegions = _resampleByRegionUS(casesUSStates.copy())


    assert casesGlobal.isnull().values.sum() == 0
    assert casesUSStates.isnull().values.sum() == 0
    assert casesUSRegions.isnull().values.sum() == 0
    assert casesBoats.isnull().values.sum() == 0
    assert casesUSCounties.isnull().values.sum() == 0

    casesGlobal.sort_index(inplace=True)
    casesUSStates.sort_index(inplace=True)
    casesUSRegions.sort_index(inplace=True)
    casesUSCounties.sort_index(inplace=True)
    casesBoats.sort_index(inplace=True)

    output = {
        'casesGlobal': casesGlobal,
        'casesUSRegions': casesUSRegions,
        'casesUSStates': casesUSStates,
        'casesBoats': casesBoats,
        'casesUSCounties': casesUSCounties,
    }

    outputFileName = resolveReportFileName(siteData, target, '')
    dumpGlobalCasesAsJSONFor(casesGlobal.copy(), outputFileName)
    dumpUSCasesAsJSONFor(casesUSRegions.copy(), outputFileName, 'US-Regions')
    dumpUSCasesAsJSONFor(casesUSStates.copy(), outputFileName)
    dumpUSCasesAsJSONFor(casesBoats.copy(), outputFileName, 'boats')
    dumpUSCountiesAsJSONFor(casesUSCounties.copy(), outputFileName)
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

    for argument in sys.argv[1:]:
        _ = parseCSSE(argument)

