import urllib
import json
import pandas as pd
from tqdm.auto import tqdm
from covidvu.pipeline.vujson import _dumpJSON

import os
from os.path import join

from os.path import join
from time import sleep

# *** constants ***
STATE_CODES_PATH = join(os.getcwd(), 'stateCodesUS.csv')
SITE_DATA               = './site-data'
OUT_FILE_NAME = 'hospital_bed_count.json'


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


def _getTotalBedCount(postCodes):
    bedCount = {}
    for n, row in tqdm(postCodes.iterrows(), total=postCodes.shape[0]):
        bedCount[row['state']] = _getTotalBedsForPostalCode(row['postalCode'])
    return bedCount


def _main(siteDataDirectory = SITE_DATA,
          outFileName = OUT_FILE_NAME,
          ):
    postCodes = pd.read_csv(STATE_CODES_PATH)
    bedCount = _getTotalBedCount(postCodes)

    _dumpJSON(bedCount, resolveFileName(siteDataDirectory, outFileName))


# *** main ***
if '__main__' == __name__:
    _main()
