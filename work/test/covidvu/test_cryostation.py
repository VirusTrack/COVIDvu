#!/usr/bin/env python3
# See: https://github.com/VirusTrack/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


from pandas.core.frame import DataFrame
from pandas.core.indexes.base import Index

import os

import pytest

import covidvu.cryostation as storage


# --- constants---

TEST_DATABASE_FILE      = 'test.db'
TEST_DATABASE_PATH      = './resources/test_databases'
TEST_DATABASE_FILE_NAME = os.path.join(TEST_DATABASE_PATH, TEST_DATABASE_FILE)

# TODO:  https://github.com/VirusTrack/COVIDvu/issues/537
REAL_DATABASE_FILE      = 'virustrack.db'
REAL_DATABASE_PATH      = './database'
REAL_DATABASE_FILE_NAME = os.path.join(REAL_DATABASE_PATH, REAL_DATABASE_FILE)

# --- tests ----

cryostation = None


# --------------------------------------------------
# BEGIN - Semantic object tests 
# --------------------------------------------------
def test_Cryostation_allCountryNames():
    with storage.Cryostation(REAL_DATABASE_FILE_NAME) as cs:
        countries = cs.allCountryNames()

    assert isinstance(countries, list)

    with storage.Cryostation(REAL_DATABASE_FILE_NAME) as c:
        assert all([country in c.keys() for country in countries])


def test_Cryostation_allProvincesOf():
    country = 'US'

    with storage.Cryostation(REAL_DATABASE_FILE_NAME) as cs:
        provinces = cs.allProvincesOf(country)

    assert isinstance(provinces, list)

    with storage.Cryostation(REAL_DATABASE_FILE_NAME) as c:
        assert all([province in c[country]['provinces'].keys() for province in provinces])


def _assertTimeSeriesDataFrameIsValid(df, expectedColumns):
    assert isinstance(df, DataFrame)
    assert (df.columns.isin(expectedColumns)).all()
    assert isinstance(df.index, Index)
    assert df.isnull().values.ravel().sum() == 0


def test_Cryostation_timeSeriesFor():
    with storage.Cryostation(REAL_DATABASE_FILE_NAME) as cs:
        countryNames = cs.allCountryNames()
        allCountries = cs.timeSeriesFor() # takes defaults
        stateNames   = cs.allProvincesOf('US')
        allUSStates  = cs.timeSeriesFor('province', 'confirmed', 'US')

    _assertTimeSeriesDataFrameIsValid(allCountries, countryNames)
    _assertTimeSeriesDataFrameIsValid(allUSStates, stateNames)
# --------------------------------------------------
# END - Semantic object tests 
# --------------------------------------------------


#--------------------------------------------------
# DON'T change the order of items in this section;
# this one ALWAYS should go first because subsequent
# tests use it.  Thanks!
#--------------------------------------------------
def test_Cryostation_creation():
    global cryostation

    cryostation = storage.Cryostation(TEST_DATABASE_FILE_NAME)

    assert cryostation
    assert isinstance(cryostation, storage.Cryostation)

    assert os.path.exists(TEST_DATABASE_FILE_NAME)
#--------------------------------------------------


def test_Cryostation___setitem__n__contains__():
    key   = 'unitTest'
    value = '4269-text'
    
    cryostation[key] = { 'key': key, 'value': value, }

    assert key in cryostation


def test_Cryostation_get():
    key = 'unitTest'

    with pytest.raises(IndexError):
        cryostation.get('bogus')

    assert 'XX' == cryostation.get('bogus', default = 'XX')

    result = cryostation._storage.all()
    result = cryostation.get(key)

    assert result['value'] == '4269-text'


def test_Cryostation___getitem__():
    key = 'unitTest'

    with pytest.raises(IndexError):
        cryostation['bogus']

    result = cryostation[key]

    assert result['value'] == '4269-text'


def test_Cryostation_items():
    result = None

    for item in cryostation.items():
        result = item
        break

    assert 'unitTest' == result[0]
    assert 'unitTest' == result[1]['key']


def test_Cryostation_keys():
    result = None

    for key in cryostation.keys():
        result = key
        break

    assert isinstance(result, str)
    assert 'unitTest' == result


#--------------------------------------------------
# At the end always!
#--------------------------------------------------
def test_Cryostation___del__():
    global cryostation

    del(cryostation)

    with pytest.raises(NameError):
        'unitTest' in cryostation

    os.unlink(TEST_DATABASE_FILE_NAME)
#--------------------------------------------------


def test_Cryostation__with():
    result = None

    with storage.Cryostation(TEST_DATABASE_FILE_NAME) as c:
        result = c.keys()

    if os.path.exists(TEST_DATABASE_FILE_NAME):
        os.unlink(TEST_DATABASE_FILE_NAME)

    assert result


# test_Cryostation_creation()
# test_Cryostation___setitem__n__contains__()
# test_Cryostation_items()
# test_Cryostation_keys()

# test_Cryostation_allCountryNames()
test_Cryostation_timeSeriesFor()

