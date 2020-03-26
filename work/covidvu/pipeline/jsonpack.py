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
REPORTS   = ( 'confirmed', 'deaths', )


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


def main():
    for grouping in GROUPINGS:
        packDataset(grouping)


# *** main ***

if '__main__' == __name__:
    main()

