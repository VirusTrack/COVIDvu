#!/usr/bin/env python3
# See: https://github.com/VirusTrack/COVIDvu/blob/master/LICENSE
# vim: set fileencoding=utf-8:


from covidvu.config import MASTER_DATABASE
from covidvu.cryostation import Cryostation
from covidvu.pipeline.vujson import dumpJSON
from covidvu.pipeline.vuupdate import SCRAPED_TODAY

import json
import os


# +++ constants +++

COUNTIES_US_FILE       = 'counties-US-all.json'
COUNTY_CASES_CSBS_FILE = 'counties-US-all-20200324.json'
SITE_RESOURCES         = 'resources'
STATE_OR_PROVINCE_KEY  = 'province'


# --- main ---

def processCounties( siteResources  = SITE_RESOURCES,
                     countiesFile   = COUNTY_CASES_CSBS_FILE,
                     siteData       = SITE_RESOURCES,
                     outputFileName = COUNTIES_US_FILE):

    print('vucounty - processing US counties for the good of humanity')

    inputFileName = os.path.join(siteResources, countiesFile)
    with open(inputFileName, 'r') as inputFile:
        regions = json.load(inputFile)

    dataset = dict()
    for region in regions:
        state = region[STATE_OR_PROVINCE_KEY]
        if state not in dataset:
            print('updating %s' % state)
            dataset[state] = dict()

        county = region['county']
        latest = region['latest']

        print('  updating %s, %s' % (county, state))

        if 'recovered' in latest:
            del(latest['recovered'])
        
        dataset[state][county] = latest

    with open(os.path.join(siteData, outputFileName), 'w') as outputStream:
        json.dump(dataset, outputStream)

    return dataset


def updateDatabaseWith(dataset):
    with Cryostation(MASTER_DATABASE) as cryostation:
        country = cryostation['US']

    for state in country['provinces'].keys():
        if 'counties' not in country['provinces'][state]:
            continue

        for county in country['provinces'][state]['counties'].keys():
            try:
                country['provinces'][state]['counties'][county]['confirmed'][SCRAPED_TODAY] = float(dataset[state][county]['confirmed'])
                country['provinces'][state]['counties'][county]['deaths'][SCRAPED_TODAY] = float(dataset[state][county]['deaths'])
            except:
                continue

    with Cryostation(MASTER_DATABASE) as cryostation:
        cryostation['US'] = country


if '__main__' == __name__:
    dataset = processCounties()
    updateDatabaseWith(dataset)

