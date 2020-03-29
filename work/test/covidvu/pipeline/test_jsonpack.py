#!/usr/bin/env python3
# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


from covidvu.pipeline.jsonpack import PREDICTIONS_FILE_NAME
from covidvu.pipeline.jsonpack import PREDICT_FILE_WORLD_PREFIX
from covidvu.pipeline.jsonpack import REPORTS
from covidvu.pipeline.jsonpack import loadUSCounties
from covidvu.pipeline.jsonpack import packDataset
from covidvu.pipeline.jsonpack import packPredictions
from covidvu.pipeline.jsonpack import sortByDate

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


def test_loadUSCounties():
    payload = loadUSCounties(siteDataDirectory = TEST_SITE_DATA)

    assert payload
    assert 'California' in payload
    assert 'San Francisco' in payload['California']
    assert 'confirmed' in payload['California']['San Francisco']


def test_packDataset():
    for grouping in TEST_GROUPINGS:
        packedDataset = packDataset(grouping, siteDataDirectory = TEST_SITE_DATA, groupings = TEST_GROUPINGS, reports = REPORTS)

        for report in REPORTS:
            assert packedDataset[report]

        inputFileName = os.path.join(TEST_SITE_DATA, TEST_GROUPINGS[grouping]+'.json')
        packedDataset = json.loads(open(inputFileName).read())

#         try:
#             os.unlink(inputFileName)
#         except:
#             pass

        testValue = packedDataset['confirmed']['!Bogus']['2020-03-15']
        assert testValue == 166684

        if '-US' == grouping:
            assert 'hospitalBeds' in packedDataset
            assert 'Alabama' in packedDataset['hospitalBeds']


def test_sortByDate():
    dataset = {
        'bogus': {
            '2020-03-26': 42,
            '2020-03-15': 69,
        }
    }
    result = sortByDate(dataset)

    assert tuple(result['bogus'].keys())[0] == '2020-03-15'


def test_main():
    pass  # It runs, the meat is in the packDataset function


def test_packPredictions():
    testFileName = os.path.join(TEST_SITE_DATA, 'prediction-crap.json')

    with open(testFileName, 'w'):
        pass
    with pytest.raises(NameError):
        packPredictions(siteDataDirectory = TEST_SITE_DATA, predictFilePrefix = 'bogus-bigus')
    os.unlink(testFileName)

    result = packPredictions(siteDataDirectory = TEST_SITE_DATA, predictFilePrefix = PREDICT_FILE_WORLD_PREFIX)

    assert 'United Kingdom' in result
    assert 'confidenceInterval' in result['United Kingdom']
    assert 'mean' in result['United Kingdom']

    testFileName = os.path.join(TEST_SITE_DATA, PREDICTIONS_FILE_NAME)
    assert os.path.exists(testFileName)
    
    os.unlink(testFileName)

