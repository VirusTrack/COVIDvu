#!/usr/bin/env python3
# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE
# vim: set fileencoding=utf-8:
import os
from os.path import join
import json
import re
import pandas as pd

from covidvu.pipeline.vuhospitals import STATE_CODES_PATH
from covidvu.pipeline.vuhospitals import OUT_FILE_NAME
from covidvu.pipeline.vuhospitals import _getTotalBedsForPostalCode
from covidvu.pipeline.vuhospitals import _getTotalBedCount
from covidvu.pipeline.vuhospitals import _main

TEST_STATE_CODES_PATH       = join(os.getcwd(), 'stateCodesUS.csv')
TEST_SITE_DATA              = join(os.getcwd(), 'resources', 'test_site_data')


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


def test__main():
    try:
        _main(TEST_SITE_DATA, nStateLimit=2)
        assertValidJSON(OUT_FILE_NAME)
    except Exception as e:
        raise e
    finally:
        _purge(TEST_SITE_DATA, '.json')
