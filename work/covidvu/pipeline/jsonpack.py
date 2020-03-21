#!/usr/bin/env python3
# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


from covidvu.pipeline.vudpatch import fetchJSONData
from covidvu.pipeline.vuhospitals import loadUSHospitalBedsCount
from covidvu.pipeline.vujson import SITE_DATA
from covidvu.pipeline.vujson import resolveReportFileName

import json
import os


# *** constants ***

# TODO: This would be better served in a config file
GROUPINGS = { 
                ''           : 'bundle-global',
                # '-Boats'     : 'bundle-boats',
                '-US'        : 'bundle-US',
                '-US-Regions': 'bundle-US-Regions',
            }
REPORTS   = ( 'confirmed', 'deaths', 'recovered', )


# +++ functions +++


def packDataset(grouping, siteDataDirectory = SITE_DATA, groupings = GROUPINGS, reports = REPORTS):
    packedDataset  = dict()
    outputFileName = os.path.join(siteDataDirectory, groupings[grouping]+'.json')
    for report in reports:
        packedDataset[report] = fetchJSONData(report, grouping, siteDataDirectory)

        if '-US' == grouping and 'confirmed' == report:
            packedDataset['hospitalBeds'] = loadUSHospitalBedsCount(siteDataDirectory)

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

