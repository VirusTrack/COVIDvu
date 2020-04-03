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
    'Algeria': 'Africa',
    'Angola': 'Africa',
    'Benin': 'Africa',
    'Botswana': 'Africa',
    'Burkina Faso': 'Africa',
    'Burundi': 'Africa',
    'Cabo Verde': 'Africa',
    'Cameroon': 'Africa',
    'Central African Republic': 'Africa',
    'Chad': 'Africa',
    'Comoros': 'Africa',
    'Congo (Kinshasa)': 'Africa',
    'Congo (Brazzaville)': 'Africa',
    "Cote d'Ivoire": 'Africa',
    'Djibouti': 'Africa',
    'Egypt': 'Africa',
    'Equatorial Guinea': 'Africa',
    'Eritrea': 'Africa',
    'Eswatini': 'Africa',
    'Ethiopia': 'Africa',
    'Gabon': 'Africa',
    'Gambia': 'Africa',
    'Ghana': 'Africa',
    'Guinea': 'Africa',
    'Guinea-Bissau': 'Africa',
    'Kenya': 'Africa',
    'Lesotho': 'Africa',
    'Liberia': 'Africa',
    'Libya': 'Africa',
    'Madagascar': 'Africa',
    'Malawi': 'Africa',
    'Mali': 'Africa',
    'Mauritania': 'Africa',
    'Mauritius': 'Africa',
    'Morocco': 'Africa',
    'Mozambique': 'Africa',
    'Namibia': 'Africa',
    'Niger': 'Africa',
    'Nigeria': 'Africa',
    'Rwanda': 'Africa',
    'Sao Tome and Principe': 'Africa',
    'Senegal': 'Africa',
    'Seychelles': 'Africa',
    'Sierra Leone': 'Africa',
    'Somalia': 'Africa',
    'South Africa': 'Africa',
    'South Sudan': 'Africa',
    'Sudan': 'Africa',
    'Tanzania': 'Africa',
    'Togo': 'Africa',
    'Tunisia': 'Africa',
    'Uganda': 'Africa',
    'Zambia': 'Africa',
    'Zimbabwe': 'Africa',

    'Afghanistan': 'Asia',
    'Armenia': 'Asia',
    'Azerbaijan': 'Asia',
    'Bahrain': 'Asia',
    'Bangladesh': 'Asia',
    'Bhutan': 'Asia',
    'Brunei': 'Asia',
    'Cambodia': 'Asia',
    'India': 'Asia',
    'Indonesia': 'Asia',
    'Iran': 'Asia',
    'Iraq': 'Asia',
    'Israel': 'Asia',
    'Japan': 'Asia',
    'Jordan': 'Asia',
    'Kazakhstan': 'Asia',
    'Kuwait': 'Asia',
    'Kyrgyzstan': 'Asia',
    'Laos': 'Asia',
    'Lebanon': 'Asia',
    'Malaysia': 'Asia',
    'Maldives': 'Asia',
    'Mongolia': 'Asia',
    'Myanmar': 'Asia',
    'Nepal': 'Asia',
    'Korea, North': 'Asia',
    'Oman': 'Asia',
    'Pakistan': 'Asia',
    'Palestine': 'Asia',
    'Philippines': 'Asia',
    'Qatar': 'Asia',
    'Saudi Arabia': 'Asia',
    'Singapore': 'Asia',
    'Korea, South': 'Asia',
    'Sri Lanka': 'Asia',
    'Syria': 'Asia',
    'Taiwan*': 'Asia',
    'Tajikistan': 'Asia',
    'Thailand': 'Asia',
    'Timor-Leste': 'Asia',
    'Turkmenistan': 'Asia',
    'United Arab Emirates': 'Asia',
    'Uzbekistan': 'Asia',
    'Vietnam': 'Asia',
    'Yemen': 'Asia',

    'Antigua and Barbuda': 'Central America',
    'Bahamas': 'Central America',
    'Barbados': 'Central America',
    'Belize': 'Central America',
    'Costa Rica': 'Central America',
    'Cuba': 'Central America',
    'Dominica': 'Central America',
    'Dominican Republic': 'Central America',
    'El Salvador': 'Central America',
    'Grenada': 'Central America',
    'Guatemala': 'Central America',
    'Haiti': 'Central America',
    'Honduras': 'Central America',
    'Jamaica': 'Central America',
    'Nicaragua': 'Central America',
    'Panama': 'Central America',
    'Saint Kitts and Nevis': 'Central America',
    'Saint Lucia': 'Central America',
    'Saint Vincent and the Grenadines': 'Central America',
    'Trinidad and Tobago': 'Central America',
    
    'China': 'Mainland China',

    # https://www.countries-ofthe-world.com/countries-of-europe.html
    'Albania': 'Europe',
    'Andorra': 'Europe',
    'Austria': 'Europe',
    'Belarus': 'Europe',
    'Belgium': 'Europe',
    'Bosnia and Herzegovina': 'Europe',
    'Bulgaria': 'Europe',
    'Croatia': 'Europe',
    'Cyprus': 'Europe',
    'Czechia': 'Europe',
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
    'Kosovo': 'Europe',
    'Latvia': 'Europe',
    'Liechtenstein': 'Europe',
    'Lithuania': 'Europe',
    'Luxembourg': 'Europe',
    'Malta': 'Europe',
    'Moldova': 'Europe',
    'Monaco': 'Europe',
    'Montenegro': 'Europe',
    'Netherlands': 'Europe',
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

    'Mexico': 'North America',
    'Canada': 'North America',
    'US'    : 'North America',

    'Australia': 'Oceania',
    'Fiji': 'Oceania',
    'Kiribati': 'Oceania',
    'Nauru': 'Oceania',
    'New Zealand': 'Oceania',
    'Tonga': 'Oceania',
    'Tuvalu': 'Oceania',
    'Vanuatu': 'Oceania',

    'Argentina': 'South America',
    'Bolivia': 'South America',
    'Brazil': 'South America',
    'Chile': 'South America',
    'Colombia': 'South America',
    'Ecuador': 'South America',
    'Guyana': 'South America',
    'Paraguay': 'South America',
    'Peru': 'South America',
    'Suriname': 'South America',
    'Uruguay': 'South America',
    'Venezuela': 'South America',

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

