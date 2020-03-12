#!/usr/bin/env python3
# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE
# vim: set fileencoding=utf-8:

from covidvu.vujson import dumpUSCasesAsJSONFor
from covidvu.vujson import JH_CSSE_FILE_CONFIRMED
from covidvu.vujson import JH_CSSE_FILE_DEATHS
from covidvu.vujson import JH_CSSE_FILE_RECOVERED
from covidvu.vujson import SITE_DATA

import os
import pandas as pd
import re
import sys

# --- main ---
def _isCounty(c):
    if re.search(r", [A-Z][A-Z]", c):
        return True
    else:
        return False

def allUSCounties(fileName = JH_CSSE_FILE_CONFIRMED):
    cases = pd.read_csv(fileName)

    casesUS       = cases[cases['Country/Region'] == 'US'].drop('Country/Region', axis=1).set_index('Province/State').T
    casesUS       = casesUS.iloc[2:]
    casesUS.index = pd.to_datetime(casesUS.index)
    casesUS.index = casesUS.index.map(lambda s: s.date())
    casesUSCounty = casesUS.loc[:, casesUS.columns.map(lambda c: _isCounty(c))]

    casesUSCounty       = casesUSCounty.reindex(sorted(casesUSCounty.columns), axis=1)
    casesUSCounty.index = pd.to_datetime(casesUSCounty.index)
    casesUSCounty.fillna(method='ffill', axis=0, inplace=True)
    return casesUSCounty


def _main(target):
    if 'confirmed' == target:
        sourceFileName = JH_CSSE_FILE_CONFIRMED
    elif 'deaths' == target:
        sourceFileName = JH_CSSE_FILE_DEATHS
    elif 'recovered' == target:
        sourceFileName = JH_CSSE_FILE_RECOVERED
    else:
        raise NotImplementedError

    casesUSCounty = allUSCounties(sourceFileName)

    outputFileName = os.path.join(SITE_DATA, target + '.json')
    dumpUSCasesAsJSONFor(casesUSCounty, outputFileName, 'US-Counties')


if '__main__' == __name__:
    # TODO: Parse command line for real?  Decide.
    #
    # Usage:  vujson.py casetype
    #         where castype is one or more of:
    #
    #         - confirmed
    #         - deaths
    #         - recovered

    for argument in sys.argv[1:]:
        _main(argument)

