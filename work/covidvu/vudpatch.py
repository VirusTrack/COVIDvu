#!/usr/bin/env python3
# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


from covidvu.vujson import SITE_DATA

import csv
import json
import datetime
import os
import sys


# --- consstants ---
COUNTRY_NAMES = {
                    'Bosnia'         : 'Bosnia and Herzegovina',
                    'Denmark*'       : 'Denmark',
                    'UAE'            : 'United Arab Emirates',
                    'United Kingdom' : 'UK',
                    'United States'  : 'US',
                }
SCRAPED_WORLD_DATA = os.path.join(SITE_DATA, 'scraped-world.tsv')
SCRAPED_US_DATA    = os.path.join(SITE_DATA, 'scraped-US.tsv')
SCRAPED_TODAY      = datetime.date.today().strftime('%m-%d-%Y')


# *** functions ***

def _fetchWorldUpdates(columnRef):
    updateWorld = dict()
    with open(SCRAPED_WORLD_DATA, 'r') as inputFile:
        rawData = csv.DictReader(inputFile, delimiter = '\t')
        for row in rawData:
            if 'Diamond' not in row['OTHER PLACES']:
                updateWorld[row['OTHER PLACES']] = { SCRAPED_TODAY: float(row[columnRef]) }

    if 'Queue' in updateWorld:
        del(updateWorld['Queue'])

    return updateWorld


def _fetchJSONData(target, region = ""):
    dataFileName = os.path.join(SITE_DATA, target+('%s.json' % region))

    with open(dataFileName, 'r') as inputFile:
        dataset = json.load(inputFile)

    return dataset


def _dumpJSON(cases, target, region = ""):
    dataFileName = os.path.join(SITE_DATA, target+('%s.json' % region))

    with open(dataFileName, 'w') as outputJSON:
        json.dump(cases, outputJSON, ensure_ascii = False)


def _homologizeUpdateData(dataset, table):
    badKeys = list()
    updates = dict()

    for key in dataset:
        if key in table:
            updates[table[key]] = dataset[key]
            badKeys.append(key)

    for key in badKeys:
        del(dataset[key])

    dataset.update(updates)

    return dataset


def _applyNewRecordsFrom(dataWorld, updates):
    for key in updates:
        if key not in dataWorld:
            dataWorld[key] = { SCRAPED_TODAY: 0.0 }

    return dataWorld


def _patchWorldData(target, columnRef):
    updateWorld = _fetchWorldUpdates(columnRef)
    updateWorld = _homologizeUpdateData(updateWorld, COUNTRY_NAMES)
    dataWorld   = _fetchJSONData(target)
    dataWorld   = _applyNewRecordsFrom(dataWorld, updateWorld)

    for country in updateWorld.keys():
        dataWorld[country][SCRAPED_TODAY] = updateWorld[country][SCRAPED_TODAY]

    _dumpJSON(dataWorld, target)


def _main(target):
    if target == 'confirmed':
        columnRef = 'Cases'
    elif target == 'deaths':
        columnRef = 'Deaths'
    elif target == 'recovered':
        columnRef = 'Recovered'

    _patchWorldData(target, columnRef)


# +++ main +++

if '__main__' == __name__:
    # TODO: Parse command line for real?  Decide.
    #
    # Usage:  vujson.py casetype
    #         where castype is one or more of:
    #
    #         - confirmed
    #         - deaths
    #         - recovered

    for argument in sys.argv[1:]:
        _main(argument)

