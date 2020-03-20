#!/usr/bin/env python3
# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


from covidvu.pipeline.vudpatch import resolveReportFileName
from covidvu.pipeline.vujson import SITE_DATA
from covidvu.pipeline.vuregions import DEFAULT_OUTPUT_JSON_FILE_NAME
from covidvu.pipeline.vuregions import COUNTRIES_REGIONS
from covidvu.pipeline.vuregions import RegionsAggregator

import json
import os


# --- constants ---

TEST_SITE_DATA = './resources/test_pipeline'


# +++ tests +++

expectedPath      = None
regionsAggregator = None    # global object - used in all tests


def test_RegionsAggregator_object():
    global regionsAggregator

    regionsAggregator = RegionsAggregator(siteData = TEST_SITE_DATA)

    assert 'confirmed' in regionsAggregator.buckets
    assert 'North America' in regionsAggregator.buckets['confirmed']
    assert regionsAggregator.globalInputDatasets

    assert 'confirmed' in regionsAggregator.globalInputDatasets
    assert 'Region' in regionsAggregator.globalInputDatasets['confirmed'].index
    dataset = regionsAggregator.globalInputDatasets['confirmed']
    dataset = dataset[dataset.index == 'Region']
    assert dataset['2020-03-15']['Region'] > 0

    assert isinstance(regionsAggregator.globalDatasets, dict)

    continentalRegions = regionsAggregator.buckets

    assert 'confirmed' in continentalRegions
    assert 'North America' in continentalRegions['confirmed']

    assert isinstance(continentalRegions['confirmed']['Continental Region'], dict)
    assert len(continentalRegions['confirmed']['Continental Region']) > 0


def test_RegionsAggregator_getCanonicalOutputFileName():
    global expectedPath

    expectedPath = os.path.join(TEST_SITE_DATA, DEFAULT_OUTPUT_JSON_FILE_NAME)
    assert expectedPath == regionsAggregator.getCanonicalOutputFileName()


def test_RegionsAggregator_JSON():
    regionsAggregator.toJSONFile()

    assert os.path.exists(expectedPath)
    os.unlink(expectedPath)


def test_COUNTRIES_REGIONS_table():
    # :o - this uses the actual current list!
    officialCountriesFileName = resolveReportFileName(SITE_DATA, 'confirmed', '')
    countriesCSSE = json.load(open(officialCountriesFileName, 'r')).keys()

    countriesCheck = [countries for countries in COUNTRIES_REGIONS.keys() if countries not in countriesCSSE ]

    assert len(countriesCheck)
    assert 'Zimbabwe' in countriesCheck


# test_COUNTRIES_REGIONS_table()

