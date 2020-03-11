#!/usr/bin/env python3
# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


from bs4 import BeautifulSoup4

from covidvu.vujson import SITE_DATA
from covidvu.vupatch import SCRAPED_US_DATA
from covidvu.vupatch import SCRAPED_WORLD_DATA

import csv
import os


# --- constants ---

US_TABLE_HTML    = os.path.join(SITE_DATA, 'table-01.html')
WORLD_TABLE_HTML = os.path.join(SITE_DATA, 'table-00.html')


# +++ functions +++

def _main():
    _process


# --- main ---

if '__main__' == __name__:
    _main()

