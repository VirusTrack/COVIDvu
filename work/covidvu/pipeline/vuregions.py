#!/usr/bin/env python3
# See: https://github.com/VirusTrack/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


from covidvu.config import MASTER_DATABASE
from covidvu.config import SITE_DATA
from covidvu.cryostation import Cryostation

import json
import os


# --- constants ---

DEFAULT_OUTPUT_JSON_FILE_NAME = 'bundle-continental-regions.json'


# +++ functions +++

def _applyCountFor(bundle, country, casesType = 'confirmed'):
    region = country['info'].get('region', None)
    if region not in bundle[casesType]:
        bundle[casesType][region] = dict()
    
    for date in country[casesType].keys():
        if date not in bundle[casesType][region]:
            bundle[casesType][region][date] = float(country[casesType][date])
        else:
           bundle[casesType][region][date] += float(country[casesType][date])


# *** main ***

def main(database = MASTER_DATABASE, siteData = SITE_DATA, bundleOutputFileName = DEFAULT_OUTPUT_JSON_FILE_NAME):
    bundle = { 
        'confirmed': { },
        'deaths': { },
    }
    casesType = ( 'confirmed', 'deaths', )
    requiredAttributes = ('info', )+casesType

    cryostation = Cryostation(database)

    for element in cryostation.items():
        country = element[1]
        
        if not all((r in country.keys() for r in requiredAttributes)):
            continue
        
        if not country['info'].get('region', None):
            continue
        
        for caseType in casesType:
            _applyCountFor(bundle, country, caseType)

    cryostation.close()

    bundleFileName = os.path.join(siteData, bundleOutputFileName)
    with open(bundleFileName, 'w') as outputStream:
        json.dump(bundle, outputStream)

    return bundle, bundleOutputFileName


if '__main__' == __name__:
    main()

