#!/usr/bin/env python3
# See: https://github.com/VirusTrack/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


from covidvu.config import MASTER_DATABASE
from covidvu.config import SITE_DATA
from covidvu.cryostation import Cryostation
from covidvu.virustrack.countryinfo import US_REGIONS
from covidvu.virustrack.countryinfo import TOTAL_US_NAME

import csv
import datetime
import os
import pytz
import sys

import tqdm


# --- constants ---

COUNTRY_NAMES = {
                    'Bosnia'             : 'Bosnia and Herzegovina',
                    'Czech Republic'     : 'Czechia',
                    'South Korea'        : 'Korea, South',
                    'World'              : '!Global',
                    'Taiwan'             : 'Taiwan*',
                    'U.S. TOTAL'         : TOTAL_US_NAME,
                    'UAE'                : 'United Arab Emirates',
                    'United States'      : 'US',
                }
NIXED_ROWS_INDEX = (
    'Diamond Princess (repatriated)',
    'Diamond Princess',
    'Grand Princess (repatriated)',
    'Grand Princess',
    'Marianas',
    'Northern Marianas',
    'Queue',
    'Recovered',
    'TBD',
    'US',
    'Unassigned',
    'United States Virgin Islands',
    'Washington D.C.',
    'Wuhan (repatriated)',
    'Wuhan Evacuee',
    'Wuhan',
)
US_STATE_NAMES = {
                    'U.S. TOTAL'              : TOTAL_US_NAME,
                    'Northern Mariana Islands': 'Northern Marianas',
                    'U.S. Virgin Islands'     : 'Virgin Islands',
                 }
SCRAPED_WORLD_DATA = os.path.join(SITE_DATA, 'scraped-world.tsv')
SCRAPED_US_DATA    = os.path.join(SITE_DATA, 'scraped-US.tsv')
SCRAPED_TODAY      = pytz.utc.localize(datetime.datetime.today()).astimezone(pytz.timezone('America/Los_Angeles')).strftime('%Y-%m-%d')


# --- globals ---


# *** functions ***

def _fetchCurrentUpdates(columnRef, index = 'LOCATION'):
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


def _updateWorldData():
    # 'Cases' -- TSV ref
    # 'confirmed' -- VirusTrack DB key
    print('  updating world...')

    updateWorldCases = _fetchCurrentUpdates('Cases')
    updateWorldCases = _homologizeUpdateData(updateWorldCases, COUNTRY_NAMES)
    updateWorldDeaths = _fetchCurrentUpdates('Deaths')
    updateWorldDeaths = _homologizeUpdateData(updateWorldDeaths, COUNTRY_NAMES)

    cryostation = Cryostation(MASTER_DATABASE)

    for countryName in tqdm.tqdm(sorted(updateWorldCases.keys())):
        if countryName in cryostation:
            country = cryostation[countryName]
            try:
                country['confirmed'][SCRAPED_TODAY] = updateWorldCases[countryName][SCRAPED_TODAY]
                country['deaths'][SCRAPED_TODAY] = updateWorldCases[countryName][SCRAPED_TODAY]
            except KeyError:
                # TODO: Eugene - Define a mechanism to add new countries reporting to the database
                pass
            cryostation[countryName] = country
        else:
            print(  '## country %s not found in database' % countryName)
    
    cryostation.close()


def _updateUSData():
    # 'Cases' -- TSV ref
    # 'confirmed' -- VirusTrack DB key
    print('  updating US...')
    updateUSCases  = _fetchCurrentUpdatesUS(columnRef = 'Cases')
    updateUSCases  = _homologizeUpdateData(updateUSCases, US_STATE_NAMES)
    updateUSDeaths = _fetchCurrentUpdatesUS(columnRef = 'Deaths')
    updateUSDeaths = _homologizeUpdateData(updateUSDeaths, US_STATE_NAMES)

    cryostation = Cryostation(MASTER_DATABASE)
    country     = cryostation['US']

    for location in tqdm.tqdm(sorted(updateUSCases.keys())):
        try:
            if location in NIXED_ROWS_INDEX:
                # TODO:  Eugene - what do we do about these uncharted locations?
                # retardedKeys.append(location)
                continue

            country['provinces'][location]['confirmed'][SCRAPED_TODAY] = updateUSCases[location][SCRAPED_TODAY]
            country['provinces'][location]['deaths'][SCRAPED_TODAY] = updateUSDeaths[location][SCRAPED_TODAY]
        except:
            print('  || Invalid location: %s' % location)
            continue

    cryostation['US'] = country
    cryostation.close()


def _updateUSRegionsData(target):
    # 'confirmed' -- VirusTrack DB key
    print('  updating US regions...')
    updateUSRegions = dict()

    cryostation = Cryostation(MASTER_DATABASE)
    country     = cryostation['US']
    allTime     = list(country['provinces'][TOTAL_US_NAME][target].keys())

    for location in tqdm.tqdm(country['provinces']):
        if location in NIXED_ROWS_INDEX:
            continue
        try:
            region = US_REGIONS[location]
            if region not in updateUSRegions:
                updateUSRegions[region] = { SCRAPED_TODAY: 0.0, }

            try:
                updateUSRegions[region][SCRAPED_TODAY] += float(country['provinces'][location][target][SCRAPED_TODAY])
            except:
                yesterday = country['provinces'][location][allTime[len(allTime)-2]]
                updateUSRegions[region][SCRAPED_TODAY] = yesterday
        except KeyError:
            print('  >> Invalid location: %s' % location)
            continue

    for region in sorted(updateUSRegions.keys()):
        country['regions'][region][target][SCRAPED_TODAY] = updateUSRegions[region][SCRAPED_TODAY]

    cryostation['US'] = country
    cryostation.close()


def _main():
    _updateWorldData()
    _updateUSData()
    _updateUSRegionsData('confirmed')
    _updateUSRegionsData('deaths')


# +++ main +++

if '__main__' == __name__:
    for argument in sys.argv[1:]:
        _main()

