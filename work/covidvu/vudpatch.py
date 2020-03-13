#!/usr/bin/env python3
# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


from covidvu.vujson import SITE_DATA
from covidvu.vujson import US_REGIONS_LONG

import csv
import json
import datetime
import os
import sys


# --- constants ---

COUNTRY_NAMES = {
                    'Bosnia'         : 'Bosnia and Herzegovina',
                    'Denmark*'       : 'Denmark',
                    'TOTAL'          : '!Global',
                    'U.S. TOTAL'     : '!Total US',
                    'UAE'            : 'United Arab Emirates',
#                    'United Kingdom' : 'UK',
                    'United States'  : 'US',
                }
SCRAPED_WORLD_DATA = os.path.join(SITE_DATA, 'scraped-world.tsv')
SCRAPED_US_DATA    = os.path.join(SITE_DATA, 'scraped-US.tsv')
SCRAPED_TODAY      = datetime.date.today().strftime('%Y-%m-%d')

STATE_NAMES = {
                    'District of Columbia': 'Washington D.C.',
                    'U.S. TOTAL'          : '!Total US',
              }


# *** functions ***

def _fetchCurrentUpdates(columnRef, index = 'OTHER PLACES'):
    updatesDataset = dict()
    with open(SCRAPED_WORLD_DATA, 'r') as inputFile:
        rawData = csv.DictReader(inputFile, delimiter = '\t')
        for row in rawData:
            ref = row[index]
            if 'Queue' == ref:
                continue
            if 'Diamond' not in row[index]:
                try:
                    bodyCount = float(row[columnRef]) if row[columnRef] != '' else 0.0
                except:
                    bodyCount = 0.0
                updatesDataset[ref] = { SCRAPED_TODAY: float(bodyCount) }

    if 'Queue' in updatesDataset:
        del(updatesDataset['Queue'])

    return updatesDataset


def _fetchCurrentUpdatesUS(columnRef, index = 'UNITED STATES'):
    updatesDataset = dict()
    with open(SCRAPED_US_DATA, 'r') as inputFile:
        rawData = csv.DictReader(inputFile, delimiter = '\t')
        for row in rawData:
            try:
                bodyCount = float(row[columnRef]) if row[columnRef] != '' else 0.0
            except:
                bodyCount = 0.0
            updatesDataset[row[index]] = { SCRAPED_TODAY: bodyCount, }

    if 'Queue' in updatesDataset:
        del(updatesDataset['Queue'])

    return updatesDataset


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


def _applyNewRecordsFrom(dataset, updates):
    for key in updates:
        if key not in dataset:
            dataset[key] = { SCRAPED_TODAY: 0.0, }

    return dataset


def _patchWorldData(target, columnRef):
    updateWorld = _fetchCurrentUpdates(columnRef)
    updateWorld = _homologizeUpdateData(updateWorld, COUNTRY_NAMES)
    dataWorld   = _fetchJSONData(target)
    dataWorld   = _applyNewRecordsFrom(dataWorld, updateWorld)

    for country in updateWorld.keys():
        dataWorld[country][SCRAPED_TODAY] = updateWorld[country][SCRAPED_TODAY]
    
    # dataWorld['!Outside Mainland China'][SCRAPED_TODAY] = dataWorld['!Global'][SCRAPED_TODAY]-dataWorld['Mainland China'][SCRAPED_TODAY]

    _dumpJSON(dataWorld, target)


def _patchUSData(target, columnRef):
    updateUS = _fetchCurrentUpdatesUS(columnRef, 'UNITED STATES')
    updateUS = _homologizeUpdateData(updateUS, STATE_NAMES)
    dataUS   = _fetchJSONData(target, "-US")
    dataUS   = _applyNewRecordsFrom(dataUS, updateUS)

    for state in updateUS.keys():
        dataUS[state][SCRAPED_TODAY] = updateUS[state][SCRAPED_TODAY]

    _dumpJSON(dataUS, target, "-US")


def _patchUSRegionsData(target, columnRef):
    updateUSRegions = dict()

    updateUS      = _fetchCurrentUpdatesUS(columnRef, 'UNITED STATES')
    updateUS      = _homologizeUpdateData(updateUS, STATE_NAMES)
    dataUSRegions = _fetchJSONData(target, '-US-Regions')
    totalUS       = 0.0

    for state in updateUS:
        region = US_REGIONS_LONG[state]
        if region not in updateUSRegions:
            updateUSRegions[region] = { SCRAPED_TODAY: 0.0, }

        updateUSRegions[region][SCRAPED_TODAY] += float(updateUS[state][SCRAPED_TODAY])

    for key in updateUSRegions.keys():
        try:
            datum = updateUSRegions[key][SCRAPED_TODAY]
            dataUSRegions[key][SCRAPED_TODAY] = datum
            totalUS += datum
        except:
            continue

    dataUSRegions['!Total US'][SCRAPED_TODAY] = totalUS
    _dumpJSON(dataUSRegions, target, "-US-Regions")


def _main(target):
    if target == 'confirmed':
        columnRef = 'Cases'
    elif target == 'deaths':
        columnRef = 'Deaths'
    elif target == 'recovered':
        columnRef = 'Recovered'

    _patchWorldData(target, columnRef)
#     _patchUSData(target, columnRef)
#     _patchUSRegionsData(target, columnRef)


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

