#!/usr/bin/env python3
# See: https://github.com/VirusTrack/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


import os

import pytest

import covidvu.cryostation as storage


# --- constants---

TEST_DATABASE_FILE      = 'test.db'
TEST_DATABASE_PATH      = './resources/test_databases'
TEST_DATABASE_FILE_NAME = os.path.join(TEST_DATABASE_PATH, TEST_DATABASE_FILE)


# --- tests ----

cryostation = None

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

