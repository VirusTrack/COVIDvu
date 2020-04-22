#!/usr/bin/env python3
# See: https://github.com/VirusTrack/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


from bs4 import BeautifulSoup

from covidvu.pipeline.vujson import SITE_DATA
from covidvu.pipeline.vuupdate import SCRAPED_US_DATA
from covidvu.pipeline.vuupdate import SCRAPED_WORLD_DATA

import copy
import csv
import os


# --- constants ---

RUSTLER_COUNTRY_COLUMNS = {
    'Total:': 'TOTAL',
    'USA': 'United States',
    'S. Korea': 'South Korea',
    'Bosnia and Herzegovina': 'Bosnia',
    'CAR': 'Central African Republic',
    'Congo': 'Congo Republic',
    'Czechia': 'Czech Republic',
    'DRC': 'DR Congo',
    'Macao': 'Macau',
    'Turks and Caicos': 'Turks and Caicos Islands',
    'UAE': 'United Arab Emirates',
    'UK': 'United Kingdom',
    
}

RUSTLER_HEADERS = {
    'Country,Other': 'LOCATION',
    'NewCases': 'New cases',
    'NewDeaths': 'New deaths',
    'TotalCases': 'Cases',
    'TotalDeaths': 'Deaths',
    'USAState': 'UNITED STATES',
} 

RUSTLER_IGNORE_COUNTRY = (
    # These are mixed with the country names columng - ignore the rows
    '',
    'Africa',
    'Asia',
    'Caribbean Netherlands',
    'Channel Islands',
    'China',
    'Europe',
    'Faeroe Islands',
    'French Guiana',
    'Guadeloupe',
    'Martinique',
    'Mayotte',
    'North America',
    'Oceania',
    'Réunion',
    'Saint Martin',
    'Saint Pierre Miquelon',
    'South America',
    'St. Bart',
    'St. Barth',
    'St. Vincent Grenadines',
)

RUSTLER_IGNORE_STATE = (
    'Diamond Princess Ship',
    'Federal Prisons',
    'Grand Princess Ship',
    'Guam',
    'Marianas',
    'Navajo Nation',
    'Northern Mariana Islands',
    'Total:',
    'US Military',
    'United States Virgin Islands',
    'Wuhan Repatriated',
)

RUSTLER_STATE_COLUMNS = {
    'USA Total': 'U.S. TOTAL',
    'District Of Columbia': 'District of Columbia',
}


# +++ functions +++

def _generateWorldCSV(targetFileName, dataSource = None, maxColumns = 5):
    print("generating world data")
    source = BeautifulSoup(open(dataSource).read(), 'html.parser')
    table  = source.find('table')

    header = list()
    for tableHeader in table.find_all('th'):
        headerText = RUSTLER_HEADERS.get(tableHeader.text, '')
        if len(headerText):
            header.append(headerText)

    rows = list()
    rows.append(header)
    for tableRow in table.find_all('tr'):
        try:
            row = list()
            columns = 0
            if not len(tableRow.find_all('td')):
                continue
            for column in tableRow.find_all('td'):
                rowDatum = column.text.replace(',', '').replace('+', '').strip()
                if rowDatum in RUSTLER_IGNORE_COUNTRY and columns < 1:
                    raise Exception

                rowDatum = RUSTLER_COUNTRY_COLUMNS.get(rowDatum, rowDatum)
                row.append(rowDatum)
                columns += 1
                if columns == maxColumns:
                    break

            rows.append(row)
        except:
            continue

    # Scrub dead-end totals:
    nix = -1
    offset = 0
    count = 0
    for row in rows:
        if 'Total' == row[0]:
            count += 1
            if count == 1:
                nix = offset

        offset += 1

    # TODO: Slice instead of this, next version
    for count in range(8):
        del(rows[nix])

    with open(targetFileName, 'w') as outputFile:
        csv.writer(outputFile, delimiter = '\t').writerows(rows)


def _generateUSCSV(targetFileName, dataSource = None, maxColumns = 5):
    print("generating US data")
    source = BeautifulSoup(open(dataSource).read(), 'html.parser')
    table  = source.find('table')

    header = list()
    for tableHeader in table.find_all('th'):
        x = tableHeader.text
        headerText = RUSTLER_HEADERS.get(tableHeader.text, '')
        if len(headerText):
            header.append(headerText)

    rows = list()
    rows.append(header)
    for tableRow in table.find_all('tr'):
        try:
            row = list()
            columns = 0
            if not len(tableRow.find_all('td')):
                continue
            for column in tableRow.find_all('td'):
                rowDatum = column.text.replace(',', '').replace('+', '').strip()
                if rowDatum in RUSTLER_IGNORE_STATE and columns < 1:
                    raise Exception

                rowDatum = RUSTLER_STATE_COLUMNS.get(rowDatum, rowDatum)
                row.append(rowDatum)
                columns += 1
                if columns == maxColumns:
                    break

            rows.append(row)
        except:
            continue

    with open(targetFileName, 'w') as outputFile:
        csv.writer(outputFile, delimiter = '\t').writerows(rows)


def processHTML2CSV(dataLake = SITE_DATA):
    _generateWorldCSV(SCRAPED_WORLD_DATA, './site-data/table-00.html')
    _generateUSCSV(SCRAPED_US_DATA, './site-data/table-01.html')


def _main():
    processHTML2CSV()


# --- main ---

if '__main__' == __name__:
    _main()

