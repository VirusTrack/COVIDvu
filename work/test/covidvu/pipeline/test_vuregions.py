#!/usr/bin/env python3
# See: https://github.com/VirusTrack/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


from covidvu.pipeline.vudpatch import resolveReportFileName
from covidvu.pipeline.vujson import SITE_DATA
from covidvu.pipeline.vujson import parseCSSE
from covidvu.pipeline.vuregions import DEFAULT_OUTPUT_JSON_FILE_NAME
from covidvu.pipeline.vuregions import COUNTRIES_REGIONS
from covidvu.pipeline.vuregions import RegionsAggregator

import json
import os
import re


# --- constants ---

TEST_SITE_DATA = './resources/test_pipeline'

TEST_JH_CSSE_PATH = os.path.join(os.getcwd(), 'resources', 'test_COVID-19','csse_covid_19_data','csse_covid_19_time_series')
TEST_JH_CSSE_FILE_CONFIRMED    = os.path.join(TEST_JH_CSSE_PATH, 'time_series_covid19_confirmed_global.csv')
TEST_JH_CSSE_FILE_DEATHS       = os.path.join(TEST_JH_CSSE_PATH, 'time_series_covid19_deaths_global.csv')
TEST_JH_CSSE_FILE_CONFIRMED_US = os.path.join(TEST_JH_CSSE_PATH, 'time_series_covid19_confirmed_US.csv')
TEST_JH_CSSE_FILE_DEATHS_US    = os.path.join(TEST_JH_CSSE_PATH, 'time_series_covid19_deaths_US.csv')

# +++ tests +++

expectedPath      = None
regionsAggregator = None    # global object - used in all tests


def _purge(purgeDirectory, pattern):
    for f in os.listdir(purgeDirectory):
        if re.search(pattern, f):
            os.remove(os.path.join(purgeDirectory, f))


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
    testSiteData = os.path.join(os.getcwd(), 'resources', 'test_site_data')
    officialCountriesFileName = resolveReportFileName(testSiteData, 'confirmed', '')

    try:
        _ =  parseCSSE('confirmed',
              siteData=testSiteData,
              jhCSSEFileConfirmed=TEST_JH_CSSE_FILE_CONFIRMED,
              jhCSSEFileDeaths=TEST_JH_CSSE_FILE_DEATHS,
              jhCSSEFileConfirmedUS=TEST_JH_CSSE_FILE_CONFIRMED_US,
              jhCSSEFileDeathsUS=TEST_JH_CSSE_FILE_DEATHS_US,
              )

        countriesCSSE = json.load(open(officialCountriesFileName, 'r')).keys()

        countriesCheck = [countries for countries in COUNTRIES_REGIONS.keys() if countries not in countriesCSSE ]

        assert len(countriesCheck)
        assert 'Other Region' in countriesCheck
    except Exception as e:
        raise e
    finally:
        _purge(testSiteData, '.json')


