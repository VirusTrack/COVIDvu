#!/usr/bin/env python3
# See: https://github.com/VirusTrack/COVIDvu/blob/master/LICENSE
# vim: set fileencoding=utf-8:


from os.path import join

from covidvu.pipeline.vuhospitals import _getTotalBedsForPostalCode
from covidvu.pipeline.vuhospitals import _main

import os
import re


# +++ a few constants +++

TEST_STATE_CODES_PATH       = join(os.getcwd(), 'stateCodesUS.csv')
TEST_SITE_DATA              = join(os.getcwd(), 'resources', 'test_pipeline')


# *** functions ***

def _purge(purgeDirectory, pattern):
    for f in os.listdir(purgeDirectory):
        if re.search(pattern, f):
            os.remove(os.path.join(purgeDirectory, f))


# *** tests ***

def test__getTotalBedsForPostalCode():
    totalBeds = _getTotalBedsForPostalCode('NC')
    assert totalBeds > 0


def test__main():
    result = _main(TEST_SITE_DATA, nStateLimit=2)
    
    assert isinstance(result, dict)
    assert 'hospitalBedsCount' in result['provinces']['California']

