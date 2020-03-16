#!/usr/bin/env python3
# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


from covidvu.pipeline.vudpatch import fetchJSONData
from covidvu.pipeline.vujson import SITE_DATA
from covidvu.pipeline.vujson import resolveReportFileName

import json
import os
import sys


# *** constants ***

# TODO: This would be better served in a config file
GROUPINGS = { 
                ''           : 'bundle-global',
                '-Boats'     : 'bundle-boats',
                '-US'        : 'bundle-US',
                '-US-Regions': 'bundle-US-Regions',
            }
REPORTS   = ( 'confirmed', 'deaths', 'recovered', )


# +++ functions +++


def packDataset(grouping, siteDataDirectory = SITE_DATA, groupings = GROUPINGS, reports = REPORTS, scrub = True):
    packedDataset  = dict()
    outputFileName = os.path.join(siteDataDirectory, groupings[grouping]+'.json')
    for report in reports:
        packedDataset[report] = fetchJSONData(report, grouping, siteDataDirectory)
        reportFileName        = resolveReportFileName(siteDataDirectory, report, grouping)
        with open(outputFileName, 'w') as outputStream:
            json.dump(packedDataset, outputStream)

        if scrub:
            try:
                os.unlink(reportFileName)
            except:
                pass
        
    return packedDataset


def main():
    scrubFlag = len(sys.argv) <= 1
    x = sys.argv
    for grouping in GROUPINGS:
        packDataset(grouping, scrub = scrubFlag)


# *** main ***

if '__main__' == __name__:
    main()

