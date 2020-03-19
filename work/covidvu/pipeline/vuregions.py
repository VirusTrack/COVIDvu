#!/usr/bin/env python3
# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


from covidvu.pipeline.jsonpack import REPORTS
from covidvu.pipeline.vujson import SITE_DATA

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
}


# --- functions ---


# --- classes ---

class RegionsAggregator(object):
    # *** private ***

    def _init(self):
        self.buckets             = dict()
        self.globalInputDatasets = dict()
        self.globalDatasets      = dict()

        for report in REPORTS:
            fileName = os.path.join(SITE_DATA, report+'.json')
            self.globalInputDatasets[report] = pd.read_json(fileName).T

        for region in set(COUNTRIES_REGIONS.values()):
            self.buckets[region] = pd.DataFrame()


    # *** public ***

    def __init__(self):
        self.buckets             = None
        self.globalInputDatasets = None
        self.globalDatasets      = None

        self._init()


    def groupContinentalRegions(self):
        a = self.buckets
        for report in REPORTS:
            for country in self.globalInputDatasets[report].index:
                if country in COUNTRIES_REGIONS:
                    dataset = self.globalInputDatasets[report]
                    continentalRegion = COUNTRIES_REGIONS[country]
                    dataset = dataset[dataset.index == country]
                    self.buckets[continentalRegion] = self.buckets[continentalRegion].append(dataset)

        b = a['North America'].index
        return self.buckets


# *** main ***

def main():
    pass


if '__main__' == __name__:
    main()

