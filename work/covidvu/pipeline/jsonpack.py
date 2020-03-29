#!/usr/bin/env python3
# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


from covidvu.pipeline.vudpatch import fetchJSONData
from covidvu.pipeline.vuhospitals import loadUSHospitalBedsCount
from covidvu.pipeline.vujson import SITE_DATA

import collections
import json
import os


# *** constants ***

# TODO: This would be better served in a config file
COUNTIES_US_FILE_NAME='counties-US-all.json'
GROUPINGS = { 
                ''           : 'bundle-global',
                # '-Boats'     : 'bundle-boats',
                '-US'        : 'bundle-US',
                '-US-Regions': 'bundle-US-Regions',
            }
PREDICT_FILE_PREFIX   = 'prediction-'
PREDICTIONS_FILE_NAME = 'bundle-predictions-global.json'
REPORTS               = ( 'confirmed', 'deaths', )


# +++ functions +++


def loadUSCounties(siteDataDirectory = SITE_DATA, datasetFile = COUNTIES_US_FILE_NAME):
    countiesFileName = os.path.join(siteDataDirectory, datasetFile)
    with open(countiesFileName, 'r') as inputFile:
        payload = json.load(inputFile)

    return payload


def sortByDate(dataset):
    result = dict()
    for cases in dataset.keys():
        ordered = collections.OrderedDict(sorted(dataset[cases].items()))
        result[cases] = ordered

    return result


def packDataset(grouping, siteDataDirectory = SITE_DATA, groupings = GROUPINGS, reports = REPORTS):
    packedDataset  = dict()
    outputFileName = os.path.join(siteDataDirectory, groupings[grouping]+'.json')
    for report in reports:
        dataset = sortByDate(fetchJSONData(report, grouping, siteDataDirectory))
        packedDataset[report] = dataset

        if '-US' == grouping and 'confirmed' == report:
            packedDataset['hospitalBeds'] = loadUSHospitalBedsCount(siteDataDirectory)
            packedDataset['allCounties']  = loadUSCounties(siteDataDirectory)

        # reportFileName = resolveReportFileName(siteDataDirectory, report, grouping)
        with open(outputFileName, 'w') as outputStream:
            json.dump(packedDataset, outputStream)

    return packedDataset


def packWorldPredictions(siteDataDirectory = SITE_DATA):
    predictionFileNames = [ os.path.join(siteDataDirectory, fileName) for fileName in os.listdir(siteDataDirectory) if PREDICT_FILE_PREFIX in fileName ]
    
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

    outputBundleFileName = os.path.join(siteDataDirectory, PREDICTIONS_FILE_NAME)

    with open(outputBundleFileName, 'w') as outputStream:
        json.dump(predictions, outputStream)
    
    return predictions


def main():
    for grouping in GROUPINGS:
        packDataset(grouping)

    packWorldPredictions()


# *** main ***

if '__main__' == __name__:
    main()

