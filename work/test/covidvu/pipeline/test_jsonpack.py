#!/usr/bin/env python3
# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


from covidvu.pipeline.jsonpack import REPORTS
from covidvu.pipeline.jsonpack import packDataset

import json
import os


# +++ constants +++
TEST_SITE_DATA='./resources/test_pipeline'

TEST_GROUPINGS = {
                    ''   : 'test-global',
                    '-US': 'test-US',
                }


# *** tests ***


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


def test_main():
    pass  # It runs, the meat is in the packDataset function

