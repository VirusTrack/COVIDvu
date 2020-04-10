#!/usr/bin/env python3
# See: https://github.com/VirusTrack/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


from covidvu.config import MASTER_DATABASE
from covidvu.config import SITE_DATA
from covidvu.cryostation import Cryostation
from covidvu.pipeline.vuhospitals import loadUSHospitalBedsCount

import collections
import json
import os

import tqdm


# *** constants ***

# TODO: This would be better served in a config file
BUNDLE_GLOBAL_JSON     = 'bundle-global.json'
BUNDLE_US_JSON         = 'bundle-US.json'
BUNDLE_US_REGIONS_JSON = 'bundle-US-Regions.json'
COUNTIES_US_FILE_NAME  ='counties-US-all.json'
PREDICT_FILE_US_PREFIX        = 'prediction-US'
PREDICT_FILE_WORLD_PREFIX     = 'prediction-world'
# TODO:  Make these configurable or template
PREDICTIONS_GLOBAL_FILE_NAME  = 'bundle-global-predictions.json'
PREDICTIONS_US_FILE_NAME      = 'bundle-US-predictions.json' 


# +++ functions +++


def packGlobal(siteData = SITE_DATA):
    bundle = { 'confirmed': dict(), 'deaths': dict(), }
    cryostation = Cryostation(MASTER_DATABASE)

    for key in tqdm.tqdm(cryostation.keys()):
        if 'confirmed' in cryostation[key]:
            bundle['confirmed'][key] = cryostation[key]['confirmed']
            bundle['deaths'][key] = cryostation[key]['deaths']

    cryostation.close()

    fileName = os.path.join(siteData, BUNDLE_GLOBAL_JSON)
    with open(fileName, 'w') as outputStream:
        json.dump(bundle, outputStream)


def packCountry(countryName = 'US', siteData = SITE_DATA):
    bundle = { 'confirmed': dict(), 'deaths': dict(), 'allCounties': dict(), }
    cryostation = Cryostation(MASTER_DATABASE)

    country = cryostation[countryName]

    for state in country['provinces']:
        if 'confirmed' in country['provinces'][state]:
            bundle['confirmed'][state] = country['provinces'][state]['confirmed']
            bundle['deaths'][state] = country['provinces'][state]['deaths']
        if 'counties' in country['provinces'][state]:
            bundle['allCounties'][state] = country['provinces'][state]['counties']

    cryostation.close()

    bundle['hospitalBeds'] = loadUSHospitalBedsCount(siteData)

    fileName = os.path.join(siteData, BUNDLE_US_JSON)
    with open(fileName, 'w') as outputStream:
        json.dump(bundle, outputStream)


def packRegions(countryName = 'US', siteData = SITE_DATA):
    bundle = { 'confirmed': dict(), 'deaths': dict(), }
    cryostation = Cryostation(MASTER_DATABASE)

    country = cryostation[countryName]

    for region in country['regions']:
        if 'confirmed' in country['regions'][region]:
            bundle['confirmed'][region] = country['regions'][region]['confirmed']
            bundle['deaths'][region] = country['regions'][region]['deaths']

    cryostation.close()

    fileName = os.path.join(siteData, BUNDLE_US_REGIONS_JSON)
    with open(fileName, 'w') as outputStream:
        json.dump(bundle, outputStream)
    
    
def packPredictions( 
            siteDataDirectory = SITE_DATA,
            predictFilePrefix = PREDICT_FILE_WORLD_PREFIX,
            bundleTargetFileName = PREDICTIONS_GLOBAL_FILE_NAME):

    predictionFileNames = [ os.path.join(siteDataDirectory, fileName) for fileName in os.listdir(siteDataDirectory) if predictFilePrefix in fileName ]
    
    predictions = {  }

    for fileName in predictionFileNames:
        if 'conf-int' in fileName:
            valuesRangeTag = 'confidenceInterval'
        elif 'mean-' in fileName:
            valuesRangeTag = 'mean'
        else:
            raise NameError

        dataset = json.loads(open(fileName, 'r').read())
        country = tuple(dataset.keys())[0]
        if country not in predictions:
            predictions[country] = dict()

        predictions[country][valuesRangeTag] = dataset[country]

    outputBundleFileName = os.path.join(siteDataDirectory, bundleTargetFileName)

    with open(outputBundleFileName, 'w') as outputStream:
        json.dump(predictions, outputStream)
    
    return predictions


def main():
    packGlobal()
    packCountry('US')
    packRegions('US')

    packPredictions()
    packPredictions(predictFilePrefix = PREDICT_FILE_US_PREFIX, bundleTargetFileName = PREDICTIONS_US_FILE_NAME)


# *** main ***

if '__main__' == __name__:
    main()

