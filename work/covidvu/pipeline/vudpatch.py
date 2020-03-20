#!/usr/bin/env python3
# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


from covidvu.pipeline.vujson import SITE_DATA
from covidvu.pipeline.vujson import US_REGIONS_LONG
from covidvu.pipeline.vujson import resolveReportFileName

import csv
import datetime
import json
import os
import pytz
import sys


# --- constants ---

COUNTRY_NAMES = {
                    'Bosnia'             : 'Bosnia and Herzegovina',
                    'Czech Republic'     : 'Czechia',
                    'South Korea'        : 'Korea, South',
                    'TOTAL'              : '!Global',
                    'Taiwan'             : 'Taiwan*',
                    'U.S. TOTAL'         : '!Total US',
                    'UAE'                : 'United Arab Emirates',
                    'United States'      : 'US',
                }
NIXED_ROWS_INDEX = (
    'Diamond Princess (repatriated)',
    'Diamond Princess',
    'Grand Princess (repatriated)',
    'Grand Princess',
    'Queue',
    'TBD',
    'Unassigned',
    'Wuhan (repatriated)',
    'Wuhan',
)
US_STATE_NAMES = {
                    'U.S. TOTAL'              : '!Total US',
                    'Northern Mariana Islands': 'Northern Marianas',
                    'U.S. Virgin Islands'     : 'Virgin Islands',
                 }
SCRAPED_WORLD_DATA = os.path.join(SITE_DATA, 'scraped-world.tsv')
SCRAPED_US_DATA    = os.path.join(SITE_DATA, 'scraped-US.tsv')
SCRAPED_TODAY      = pytz.utc.localize(datetime.datetime.today()).astimezone(pytz.timezone('America/Los_Angeles')).strftime('%Y-%m-%d')


# --- globals ---


# *** functions ***

def _fetchCurrentUpdates(columnRef, index = 'WORLD'):
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


def fetchJSONData(report, region = "", siteDataDirectory = SITE_DATA):
    dataFileName = resolveReportFileName(siteDataDirectory, report, region)

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
    dataWorld   = fetchJSONData(target)
    dataWorld   = _applyNewRecordsFrom(dataWorld, updateWorld)

    for country in updateWorld.keys():
        dataWorld[country][SCRAPED_TODAY] = updateWorld[country][SCRAPED_TODAY]
    
    # dataWorld['!Outside Mainland China'][SCRAPED_TODAY] = dataWorld['!Global'][SCRAPED_TODAY]-dataWorld['Mainland China'][SCRAPED_TODAY]

    return dataWorld


def _patchUSData(target, columnRef):
    updateUS  = _fetchCurrentUpdatesUS(columnRef = columnRef)
    # TODO:  Determine if there's need to homologize them
    updateUS  = _homologizeUpdateData(updateUS, US_STATE_NAMES)
    dataUS    = fetchJSONData(target, "-US")

    # Heuristic - CSSE data includes DC twice; the deleted one is empty.
    del(dataUS['Washington D.C.'])

    allTime   = list(dataUS['!Total US'].keys())    # TODO:  Fix until we identify better data sources.
    yesterday = dataUS['!Total US'][allTime[len(allTime)-2]]
    today     = dataUS['!Total US'][allTime[len(allTime)-1]]

    for location in updateUS.keys():
        try:
                if location in NIXED_ROWS_INDEX:
                    continue

                dataUS[location][SCRAPED_TODAY] = updateUS[location][SCRAPED_TODAY]
        except:
            print('  || Invalid location: %s' % location)
            continue

    if today == 0.0:
       dataUS['!Total US'][allTime[len(allTime)-1]] = yesterday

    return dataUS


def _patchUSRegionsData(target, dataUS):
    dataUSRegions   = fetchJSONData(target, '-US-Regions')
    updateUSRegions = dict()
    allTime         = list(dataUS['!Total US'].keys())    # TODO:  Fix until we identify better data sources.

    for location in dataUS:
        if location in NIXED_ROWS_INDEX:
            continue
        try:
            region = US_REGIONS_LONG[location]
            if region not in updateUSRegions:
                updateUSRegions[region] = { SCRAPED_TODAY: 0.0, }

            try:
                updateUSRegions[region][SCRAPED_TODAY] += float(dataUS[location][SCRAPED_TODAY])
            except:
                yesterday = dataUS[location][allTime[len(allTime)-2]]
                updateUSRegions[region][SCRAPED_TODAY] = yesterday
        except KeyError:
            print('  >> Invalid location: %s' % location)
            continue

    try:
        dataUSRegions['!Total US'][SCRAPED_TODAY] = dataUS['!Total US'][SCRAPED_TODAY]
    except:
        yesterday = dataUS['!Total US'][allTime[len(allTime)-2]]
        dataUSRegions['!Total US'][SCRAPED_TODAY] = yesterday

#     if 'Unassigned' in dataUSRegions:
#         del(dataUSRegions['Unassigned'])
    if 'Unassigned' not in dataUSRegions:
        dataUSRegions['Unassigned'] = { SCRAPED_TODAY: 0.0, }

    return dataUSRegions


def syncAllUSDataReportsIn(dataWorld, dataUS, dataUSRegions):
    try:
        if dataWorld['US'][SCRAPED_TODAY] > dataUS['!Total US'][SCRAPED_TODAY]:
            dataUS['!Total US'][SCRAPED_TODAY] = dataWorld['US'][SCRAPED_TODAY]
            dataUSRegions['!Total US'][SCRAPED_TODAY] = dataWorld['US'][SCRAPED_TODAY]
        else:
            dataWorld['US'][SCRAPED_TODAY] = dataUS['!Total US'][SCRAPED_TODAY]
            dataUSRegions['!Total US'][SCRAPED_TODAY] = dataUS['!Total US'][SCRAPED_TODAY]
    except:
        dataUS['!Total US'][SCRAPED_TODAY] = dataWorld['US'][SCRAPED_TODAY]
        dataUSRegions['!Total US'][SCRAPED_TODAY] = dataWorld['US'][SCRAPED_TODAY]


def estimatedUnassignedCasesIn(dataset, totalTag = '!Total US'):
    # EXPERIMENTAL:  Don't use this for the world estimates; the heuristics are
    #                different from the country level.
    grandTotal = 0.0
    allTime    = list(dataset[totalTag].keys())    # TODO:  Fix until we identify better data sources.
    yesterday  = dataset[totalTag][allTime[len(allTime)-2]]
    dataset['Unassigned'][SCRAPED_TODAY] = grandTotal

    for key in dataset.keys():
        if totalTag == key:
            total = dataset[key][SCRAPED_TODAY]
        else:
            try:
                grandTotal += dataset[key][SCRAPED_TODAY]
            except:
                grandTotal += yesterday
                break
                

    dataset['Unassigned'][SCRAPED_TODAY] = abs(grandTotal-total)


def _nukeUnassignedIn(dataset):
    # TODO: Experimental - wait for data science to decide what we do about these guys
    del(dataset['Unassigned'])


def _main(target):
    print('patching the JSON files with latest data')
    if target == 'confirmed':
        columnRef = 'Cases'
    elif target == 'deaths':
        columnRef = 'Deaths'
    elif target == 'recovered':
        columnRef = 'Recovered'

    dataWorld     = _patchWorldData(target, columnRef)
    dataUS        = _patchUSData(target, columnRef)
    dataUSRegions = _patchUSRegionsData(target, dataUS)

    syncAllUSDataReportsIn(dataWorld, dataUS, dataUSRegions)
    estimatedUnassignedCasesIn(dataUS, totalTag = '!Total US')
    _nukeUnassignedIn(dataUSRegions)

    _dumpJSON(dataWorld, target)
    _dumpJSON(dataUS, target, "-US")
    _dumpJSON(dataUSRegions, target, "-US-Regions")


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

