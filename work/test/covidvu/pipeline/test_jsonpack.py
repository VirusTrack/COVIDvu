#!/usr/bin/env python3
# See: https://github.com/VirusTrack/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


from covidvu.pipeline.jsonpack import PREDICTIONS_GLOBAL_FILE_NAME
from covidvu.pipeline.jsonpack import PREDICT_FILE_WORLD_PREFIX
from covidvu.pipeline.jsonpack import packPredictions

import json
import os

import pytest


# +++ constants +++
TEST_SITE_DATA='./resources/test_pipeline'

TEST_GROUPINGS = {
                    ''   : 'test-global',
                    '-US': 'test-US',
                }


# *** tests ***


def test_main():
    pass  # It runs, the meat is in the packDataset function


def test_packPredictions():
    testFileName = os.path.join(TEST_SITE_DATA, 'prediction-crap.json')

    with open(testFileName, 'w'):
        pass
    with pytest.raises(NameError):
        packPredictions(siteDataDirectory = TEST_SITE_DATA, predictFilePrefix = 'prediction-')
    os.unlink(testFileName)

    result = packPredictions(siteDataDirectory = TEST_SITE_DATA, predictFilePrefix = PREDICT_FILE_WORLD_PREFIX)

    assert 'United Kingdom' in result
    assert 'confidenceInterval' in result['United Kingdom']
    assert 'mean' in result['United Kingdom']

    testFileName = os.path.join(TEST_SITE_DATA, PREDICTIONS_GLOBAL_FILE_NAME)
    assert os.path.exists(testFileName)
    
    os.unlink(testFileName)


def test_packGlobal():
    # TODO:  Implement this!
    pass


# test_packPredictions()

