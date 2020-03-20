#!/usr/bin/env python3
# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


from os.path import join
from time import sleep
from tqdm.auto import tqdm

from covidvu.pipeline.vujson import SITE_DATA
from covidvu.pipeline.vujson import dumpJSON

import json
import os
import urllib

import pandas as pd


# *** constants ***

STATE_CODES_PATH = join(os.getcwd(), 'stateCodesUS.csv')
OUT_FILE_NAME    = 'hospital-beds-count-US.json'


def resolveFileName(siteDataDirectory, outFileName):
    return join(siteDataDirectory, outFileName)


def _getTotalBedsForPostalCode(postalCode):
    url = f"http://www.communitybenefitinsight.org/api/get_hospitals.php?state={postalCode}"
    response = urllib.request.urlopen(url)
    assert response
    data = json.loads(response.read())
    totalBeds = 0
    for i in range(len(data)):
        totalBeds += int(data[i]['hospital_bed_count'])
    sleep(0.5)
    return totalBeds


def _getTotalBedCount(postCodes, nStateLimit = None):
    if nStateLimit:
        postCodes = postCodes.iloc[:nStateLimit, :]
    bedCount = {}
    for n, row in tqdm(postCodes.iterrows(), total=postCodes.shape[0]):
        bedCount[row['state']] = _getTotalBedsForPostalCode(row['postalCode'])
    return bedCount


def _main(siteDataDirectory = SITE_DATA,
          outFileName = OUT_FILE_NAME,
          nStateLimit = None,
          ):
    postCodes = pd.read_csv(STATE_CODES_PATH)
    bedCount = _getTotalBedCount(postCodes, nStateLimit=nStateLimit)

    dumpJSON(bedCount, resolveFileName(siteDataDirectory, outFileName))


# *** main ***

if '__main__' == __name__:
    _main()
