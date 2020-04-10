#!/usr/bin/env python3
# See: https://github.com/VirusTrack/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


from covidvu.pipeline.vuregions import main

import json
import os


# --- constants ---

TEST_BUNDLE_OUTPUT_FILE_NAME = 'bundle-test-regions.json'
TEST_MASTER_DATABASE         = os.path.join('./resources/test_databases', 'test-virustrack.db')
TEST_SITE_DATA               = './resources/test_pipeline'


# +++ tests +++

def test_main():
    bundle, \
    bundleFileName = main(TEST_MASTER_DATABASE, TEST_SITE_DATA, TEST_BUNDLE_OUTPUT_FILE_NAME)

    assert bundle
    assert isinstance(bundle, dict)
    assert 'confirmed' in bundle
    assert 'North America' in bundle['confirmed']

    assert os.path.exists(bundleFileName)

    altBundle = json.load(open(bundleFileName, 'r'))

    assert bundle['confirmed'].keys() == altBundle['confirmed'].keys()

    os.unlink(bundleFileName)


test_main()

