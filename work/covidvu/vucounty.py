#!/usr/bin/env python3
# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE
# vim: set fileencoding=utf-8:

from covidvu.vujson import JH_CSSE_FILE_CONFIRMED
from covidvu.vujson import JH_CSSE_FILE_DEATHS
from covidvu.vujson import JH_CSSE_FILE_RECOVERED
from covidvu.vujson import allUSCases

import pandas as pd

# --- main ---

def _main(target):
    if 'confirmed' == target:
        sourceFileName = JH_CSSE_FILE_CONFIRMED
    elif 'deaths' == target:
        sourceFileName = JH_CSSE_FILE_DEATHS
    elif 'recovered' == target:
        sourceFileName = JH_CSSE_FILE_RECOVERED
    else:
        raise NotImplementedError

    cases = pd.read_csv(sourceFileName)
    

if '__main__' == __name__:
    _main()
