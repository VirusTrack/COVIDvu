#!/usr/bin/env python3
# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


from os.path import join
from time import sleep

from covidvu.pipeline.vucounty import SITE_RESOURCES
from covidvu.pipeline.vujson import SITE_DATA
from covidvu.pipeline.vujson import dumpJSON

import json
import os
import urllib

import pandas as pd
from tqdm.auto import tqdm


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


def _getTotalBedCount(postCodes, nStateLimit = None):
    if nStateLimit:
        postCodes = postCodes.iloc[:nStateLimit, :]
    bedCount = {}
    for n, row in tqdm(postCodes.iterrows(), total=postCodes.shape[0]):
        bedCount[row['state']] = _getTotalBedsForPostalCode(row['postalCode'])
    return bedCount


def loadUSHospitalBedsCount(siteDataDirectory = SITE_DATA, inputFileName = HOSPITAL_BEDS_FILE_NAME):
    with open(resolveFileName(siteDataDirectory, inputFileName), 'r') as inputFile:
        payload = json.load(inputFile)

    return payload
    

def _main(siteDataDirectory = SITE_RESOURCES,
          outFileName = HOSPITAL_BEDS_FILE_NAME,
          nStateLimit = None,
          ):
    # TODO: Juvid - https://github.com/VirusTrack/COVIDvu/issues/445
    #       This file was deprecated, but the vuhospitals module uses
    #       it.  Revive the file (fastest) or implement a dictionary
    #       of state codes.
    postCodes = pd.read_csv(STATE_CODES_PATH)

    print('vuhospitals - getting the total hospital beds count per state')
    bedCount = _getTotalBedCount(postCodes, nStateLimit=nStateLimit)

    dumpJSON(bedCount, resolveFileName(siteDataDirectory, outFileName))


# *** main ***

if '__main__' == __name__:
    _main()

