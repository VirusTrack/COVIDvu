#!/usr/bin/env python3
# See: https://github.com/VirusTrack/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


import os

import pytest
from pandas.core.frame import DataFrame
from pandas.core.indexes.datetimes import DatetimeIndex

import covidvu.cryostation as storage
from covidvu.cryostation import getCountries
from covidvu.cryostation import getProvinces
from covidvu.cryostation import getAllTimeSeriesAsDataFrame

# --- constants---

TEST_DATABASE_FILE      = 'test.db'
TEST_DATABASE_PATH      = './resources/test_databases'
TEST_DATABASE_FILE_NAME = os.path.join(TEST_DATABASE_PATH, TEST_DATABASE_FILE)

REAL_DATABASE_FILE      = 'virustrack.db'
REAL_DATABASE_PATH      = './database'
REAL_DATABASE_FILE_NAME = os.path.join(REAL_DATABASE_PATH, REAL_DATABASE_FILE)

# --- tests ----

cryostation = None


def test_getCountries():
    countries = getCountries(REAL_DATABASE_FILE_NAME)
    assert isinstance(countries, list)
    with storage.Cryostation(REAL_DATABASE_FILE_NAME) as c:
        assert all([country in c.keys() for country in countries])



def test_getProvinces():
    country = 'US'
    provinces = getProvinces(REAL_DATABASE_FILE_NAME, country=country)
    assert isinstance(provinces, list)
    with storage.Cryostation(REAL_DATABASE_FILE_NAME) as c:
        assert all([province in c[country]['provinces'].keys() for province in provinces])


def assertTimeSeriesDataFrameIsValid(df, expectedColumns):
    assert isinstance(df, DataFrame)
    assert (df.columns.isin(expectedColumns)).all()
    assert isinstance(df.index, DatetimeIndex)
    assert df.isnull().values.ravel().sum() == 0

def test_getAllTimeSeriesAsDataFrame():
    countries = getCountries(REAL_DATABASE_FILE_NAME)
    allCountries = getAllTimeSeriesAsDataFrame(REAL_DATABASE_FILE_NAME)
    assertTimeSeriesDataFrameIsValid(allCountries, countries)

    states = getProvinces(REAL_DATABASE_FILE_NAME, country = 'US')
    allUSStates = getAllTimeSeriesAsDataFrame(REAL_DATABASE_FILE_NAME,
                                              regionType='province',
                                              provinceCountry='US'
                                              )
    assertTimeSeriesDataFrameIsValid(allUSStates, states)


#--------------------------------------------------
# At the end always!
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

