#!/usr/bin/env python3
# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE
# vim: set fileencoding=utf-8:

from covidvu.vucounty import _isCounty
from covidvu.vucounty import allUSCounties

from pandas.core.frame import DataFrame
from pandas.core.indexes.datetimes import DatetimeIndex
import os
import pandas as pd

# *** constants ***
TEST_JH_CSSE_DATA_HOME      = os.path.join(os.getcwd(), 'resources', 'test_COVID-19', 'csse_covid_19_data',
                                           'csse_covid_19_time_series')
TEST_JH_CSSE_FILE_CONFIRMED = os.path.join(TEST_JH_CSSE_DATA_HOME, 'time_series_19-covid-Confirmed.csv')


# *** functions ***

def test__isCounty():
    assert _isCounty("King County, WA")
    assert not _isCounty("New Jersey")
    assert not _isCounty("Washington, D.C.")
    assert _isCounty("King County, WA ")


def test_allUSCases():
    casesUSCounty = allUSCounties(fileName = TEST_JH_CSSE_FILE_CONFIRMED)

    assert isinstance(casesUSCounty, DataFrame)
    assert isinstance(casesUSCounty.index, DatetimeIndex)
