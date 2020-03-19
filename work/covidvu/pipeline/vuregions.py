#!/usr/bin/env python3
# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


from covidvu.pipeline.jsonpack import REPORTS
from covidvu.pipeline.vujson import SITE_DATA

import json
import os

import pandas as pd


# --- constants ---

COUNTRIES_REGIONS = {
    'Mexico': 'North America',
    'Canada': 'North America',
    'US'    : 'North America',


    # https://www.countries-ofthe-world.com/countries-of-europe.html
    'Albania': 'Europe',
    'Andorra': 'Europe',
    'Armenia': 'Europe',
    'Azerbajian': 'Europe',
    'Belarus': 'Europe',
    'Belgium': 'Europe',
    'Bosnia and Herzegovina': 'Europe',
    'Croatia': 'Europe',
    'Cyprus': 'Europe',
    'Czhechia': 'Europe',
    'Denmark': 'Europe',
    'Estonia': 'Europe',
    'Finland': 'Europe',
    'France'        : 'Europe',
    'Georgia': 'Europe',
    'Germany': 'Europe',
    'Greece': 'Europe',
    'Hungary': 'Europe',
    'Iceland': 'Europe',
    'Ireland': 'Europe',
    'Italy'         : 'Europe',
    'Kazakhstan': 'Europe',
    'Kosovo': 'Europe',
    'Latvia': 'Europe',
    'Liechtenstein': 'Europe',
    'Lithuania': 'Europe',
    'Luxembourg': 'Europe',
    'Malta': 'Europe',
    'Moldova': 'Europe',
    'Monaco': 'Europe',
    'Montenegro': 'Europe',
    'Nederlands': 'Europe',
    'North Macedonia': 'Europe',
    'Norway': 'Europe',
    'Poland': 'Europe',
    'Portugal': 'Europe',
    'Romania': 'Europe',
    'Russia': 'Europe',
    'San Marino': 'Europe',
    'Serbia': 'Europe',
    'Slovakia': 'Europe',
    'Slovenia': 'Europe',
    'Spain': 'Europe',
    'Sweden': 'Europe',
    'Switzerland': 'Europe',
    'Turkey': 'Europe',
    'Ukraine': 'Europe',
    'United Kingdom': 'Europe',
    'Vatican City': 'Europe',   # Holy See

    # For unit testing:
    'Other Region': 'Continental Region',
    'Region': 'Continental Region',
}
DEFAULT_OUTPUT_JSON_FILE_NAME = 'bundle-continental-regions.json'


# --- functions ---


# --- classes ---

class RegionsAggregator(object):
    # *** private ***

    def _init(self):
        self.buckets             = dict()
        self.globalInputDatasets = dict()
        self.globalDatasets      = dict()

        for report in REPORTS:
            fileName = os.path.join(self._siteData, report+'.json')
            self.globalInputDatasets[report] = pd.read_json(fileName).T
            self.buckets[report] = dict()

            for region in set(COUNTRIES_REGIONS.values()):
                self.buckets[report][region] = pd.DataFrame()


    def _groupContinentalRegions(self):
        for report in REPORTS:
            for country in self.globalInputDatasets[report].index:
                if country in COUNTRIES_REGIONS:
                    dataset = self.globalInputDatasets[report]
                    continentalRegion = COUNTRIES_REGIONS[country]
                    dataset = dataset[dataset.index == country]
                    self.buckets[report][continentalRegion] = self.buckets[report][continentalRegion].append(dataset)


    def _calculateTotals(self):
        for report in REPORTS:
            for continentalRegion in self.buckets[report]:
                self.buckets[report][continentalRegion] = self.buckets[report][continentalRegion].sum()
                self.buckets[report][continentalRegion].index = self.buckets[report][continentalRegion].index.map(lambda t: t.strftime('%Y-%m-%d'))
                self.buckets[report][continentalRegion] = self.buckets[report][continentalRegion].to_dict()

        return self.buckets


    # *** public ***

    def __init__(self,
                 siteData = SITE_DATA):
        self.buckets             = None
        self.globalInputDatasets = None
        self.globalDatasets      = None
        self._siteData           = siteData

        self._init()
        self._groupContinentalRegions()
        self._calculateTotals()


    def getCanonicalOutputFileName(self, fileName = DEFAULT_OUTPUT_JSON_FILE_NAME): 
        return os.path.join(self._siteData, fileName)
    

    def toJSONFile(self, fileName = DEFAULT_OUTPUT_JSON_FILE_NAME):
        outputFileName = self.getCanonicalOutputFileName(fileName)

        with open(outputFileName, 'w') as outputStream:
            json.dump(self.buckets, outputStream)
        

# *** main ***

def main():
    aggregator = RegionsAggregator()

    aggregator.toJSONFile()


if '__main__' == __name__:
    main()

