#!/usr/bin/env python3
# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE
# vim: set fileencoding=utf-8:

from covidvu.utils import computeGlobal
from covidvu.utils import computeCasesOutside
from covidvu.utils import autoReloadCode

import os
import pandas as pd

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

TEST_JH_CSSE_FILE_CONFIRMED_SMALL = os.path.join(TEST_JH_CSSE_PATH, 'csse_covid_19_data',
                                                       'csse_covid_19_time_series',
                                                       'time_series_covid19_confirmed_global_small.csv')


# *** functions ***


# *** tests ***
def test_computeGlobal():
    cases = pd.read_csv(TEST_JH_CSSE_FILE_CONFIRMED).groupby(['Country/Region']).sum().T
    cases = cases.iloc[2:]
    cases = computeGlobal(cases)
    assert "!Global" in cases.columns
    assert (cases.loc[:,cases.columns != "!Global"].sum(axis=1) == cases['!Global']).all()

def test_computeCasesOutside():
    cases = pd.read_csv(TEST_JH_CSSE_FILE_CONFIRMED).groupby(['Country/Region']).sum().T
    cases = cases.iloc[2:]
    cases = computeCasesOutside(cases, ['Mainland China'], '!Outside Mainland China')
    assert "!Outside Mainland China" in cases.columns
    assert (cases.loc[:, ~cases.columns.isin(('Mainland China', '!Outside Mainland China'))].sum(axis=1) == cases['!Outside Mainland China']).all()

def test_autoReloadCode():
    pass
