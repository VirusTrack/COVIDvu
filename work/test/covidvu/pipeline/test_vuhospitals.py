#!/usr/bin/env python3
# See: https://github.com/VirusTrack/COVIDvu/blob/master/LICENSE
# vim: set fileencoding=utf-8:


from os.path import join

from covidvu.pipeline.vuhospitals import HOSPITAL_BEDS_FILE_NAME
from covidvu.pipeline.vuhospitals import STATE_CODES_PATH
from covidvu.pipeline.vuhospitals import _getTotalBedCount
from covidvu.pipeline.vuhospitals import _getTotalBedsForPostalCode
from covidvu.pipeline.vuhospitals import _main
from covidvu.pipeline.vuhospitals import loadUSHospitalBedsCount

import os
import json
import re

import pandas as pd


# +++ a few constants +++

TEST_STATE_CODES_PATH       = join(os.getcwd(), 'stateCodesUS.csv')
TEST_SITE_DATA              = join(os.getcwd(), 'resources', 'test_pipeline')


# *** functions ***
def _purge(purgeDirectory, pattern):
    for f in os.listdir(purgeDirectory):
        if re.search(pattern, f):
            os.remove(os.path.join(purgeDirectory, f))


def assertValidJSON(fname):
    fname = os.path.join(TEST_SITE_DATA, fname)
    assert os.path.exists(fname)
    with open(fname) as f:
        jsonObject = json.load(f)
    assert isinstance(jsonObject, dict)
    assert len(jsonObject.keys()) > 0

# *** tests ***

def test__getTotalBedsForPostalCode():
    totalBeds = _getTotalBedsForPostalCode('NC')
    assert totalBeds > 0


def test__getTotalBedCount():
    postCodes = pd.read_csv(STATE_CODES_PATH)
    postCodes = postCodes.iloc[:2, :]
    bedCount = _getTotalBedCount(postCodes)
    assert isinstance(bedCount, dict)
    assert (postCodes['state'].isin(bedCount.keys())).all()
    assert all((c > 0 for c in bedCount.values()))


def test_loadUSHospitalBedsCount():
    payload = loadUSHospitalBedsCount(TEST_SITE_DATA)

    assert isinstance(payload, dict)
    assert payload['Alabama'] > 0
    

def test__main():
    _main(TEST_SITE_DATA, nStateLimit=2)
    assertValidJSON(HOSPITAL_BEDS_FILE_NAME)


# test_loadUSHospitalBedsCount()

