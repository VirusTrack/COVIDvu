#!/usr/bin/env python3
# See: https://github.com/VirusTrack/COVIDvu/blob/master/LICENSE
# vim: set fileencoding=utf-8:


from covidvu.pipeline.vucounty import processCounties
from covidvu.pipeline.vucounty import updateDatabaseWith

import json
import os


# +++ constants +++

TEST_SITE_RESOURCES            = 'resources/test_pipeline'
TEST_COUNTY_CASES_CSBS_US_FILE = 'counties-US-CSBS.json'
TEST_COUNTY_CASES_US_FILE      = 'bogus.json'
TEST_SITE_DATA                 = 'resources/test_pipeline'


# --- tests ---

def test_processCounties():
    dataset = processCounties(
                TEST_SITE_RESOURCES,
                TEST_COUNTY_CASES_CSBS_US_FILE,
                TEST_SITE_DATA,
                TEST_COUNTY_CASES_US_FILE)

    assert 'California' in dataset
    assert 'San Francisco' in dataset['California']
    assert dataset['California']['San Francisco']['confirmed'] > 0


def test_processCounties_JSON():
    # It must follow test_processCounties()
    testFileName = os.path.join(TEST_SITE_DATA, TEST_COUNTY_CASES_US_FILE)

    dataset = json.loads(open(testFileName, 'r').read())
    os.unlink(testFileName)

    assert 'California' in dataset
    assert 'San Francisco' in dataset['California']
    assert dataset['California']['San Francisco']['confirmed'] > 0


def test_upddateDatabaseWith():
    pass

