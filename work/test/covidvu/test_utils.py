#!/usr/bin/env python3
# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE
# vim: set fileencoding=utf-8:

from covidvu.utils import computeGlobal
from covidvu.utils import computeCasesOutside
from covidvu.utils import autoReloadCode

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
def test_computeGlobal():
    cases = pd.read_csv(TEST_JH_CSSE_FILE_CONFIRMED).groupby(['Country/Region']).sum().T
    cases = computeGlobal(cases)
    assert "!Global" in cases.columns
    assert (cases.loc[:,cases.columns != "!Global"].sum(axis=1) == cases['!Global']).all()

def test_computeCasesOutside():
    cases = pd.read_csv(TEST_JH_CSSE_FILE_CONFIRMED).groupby(['Country/Region']).sum().T
    cases = computeCasesOutside(cases, ['Mainland China'], '!Outside Mainland China')
    assert "!Outside Mainland China" in cases.columns
    assert (cases.loc[:, cases.columns != "Mainland China"].sum(axis=1) == cases['!Outside Mainland China']).all()

def test_autoReloadCode():
    pass
