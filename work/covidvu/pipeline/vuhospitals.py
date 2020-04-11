#!/usr/bin/env python3
# See: https://github.com/VirusTrack/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


from os.path import join
from time import sleep

from tqdm.auto import tqdm

from covidvu.config import MASTER_DATABASE
from covidvu.config import SITE_DATA
from covidvu.cryostation import Cryostation
from covidvu.pipeline.vucounty import SITE_RESOURCES

import json
import os
import urllib


# *** constants ***

ENDPOINT_REQUEST_DELAY  = 0.5 # seconds
STATE_CODES_PATH        = join(os.getcwd(), 'stateCodesUS.csv')
HOSPITAL_BEDS_FILE_NAME = 'hospital-beds-count-US.json'


def resolveFileName(siteDataDirectory, outFileName):
    return join(siteDataDirectory, outFileName)


def _getTotalBedsForPostalCode(postalCode):
    # TODO: This looks a bit meh...  not a good practice for RESTful web services, I'll 
    url = f"http://www.communitybenefitinsight.org/api/get_hospitals.php?state={postalCode}"
    response = urllib.request.urlopen(url)
    assert response
    data = json.loads(response.read())
    totalBeds = 0
    for i in range(len(data)):
        totalBeds += int(data[i]['hospital_bed_count'])
    sleep(ENDPOINT_REQUEST_DELAY)

    return totalBeds


def loadUSHospitalBedsCount(siteDataDirectory = SITE_DATA, inputFileName = HOSPITAL_BEDS_FILE_NAME):
    with open(resolveFileName(siteDataDirectory, inputFileName), 'r') as inputFile:
        payload = json.load(inputFile)

    return payload
    

def _main(siteDataDirectory = SITE_RESOURCES,
          database = MASTER_DATABASE,
          nStateLimit = 1000, # unreachable "infinite" limit
          ):
    
    print('vuhospitals - getting the total hospital beds count per state')

    with Cryostation(database) as cryostation:
        country   = cryostation['US']
        postCodes = country['provinceCodes']

        count = 0
        for state in tqdm(postCodes.keys()):
            if state in country['provinces']:
                country['provinces'][state]['hospitalBedsCount'] = _getTotalBedsForPostalCode(postCodes[state]['postalCode'])

                # Artificial break for unit tests
                count += 1
                if count == nStateLimit:
                    break

        cryostation['US'] = country
        
        return country


# *** main ***

if '__main__' == __name__:
    _main()

