#!/usr/bin/env python3
# See: https://github.com/VirusTrack/COVIDvu/blob/master/LICENSE
# vim: set fileencoding=utf-8:

from covidvu.config import MASTER_DATABASE
from covidvu.cryostation import Cryostation
from tqdm.auto import tqdm
import pandas as pd

# --- constants ---
WINDOW_SIZE = 7
TODAY_DATE = pd.Timestamp.today().date()

# *** functions ***
def _computeGrowthFor(confirmedCases, windowSize):
    confirmedCasesSmooth = confirmedCases.copy().rolling(windowSize, axis=0).mean()
    newCases = confirmedCasesSmooth.diff(axis=0)
    growthFactor = newCases/newCases.shift(1)
    return growthFactor


def _getGrowthGaugeData(growth, todayDate):
    yesterdayDate   = todayDate - pd.Timedelta(1, 'D')
    lastWeekDate    = todayDate - pd.Timedelta(7, 'D')
    lastTwoWeekDate = todayDate - pd.Timedelta(14, 'D')

    yesterdayGrowth   = growth.loc[yesterdayDate]
    lastWeekGrowth    = growth.loc[lastWeekDate]
    lastTwoWeekGrowth = growth.loc[lastTwoWeekDate]
    return {
                'yesterday': yesterdayGrowth,
                'lastWeek': lastWeekGrowth,
                'lastTwoWeek': lastTwoWeekGrowth,
           }


def _appendGrowthToCountries(growthGaugeDataCountries, databasePath, disableProgressBar=True):
    countryNameAll = list(growthGaugeDataCountries['yesterday'].index)
    for countryName in tqdm(countryNameAll, disable=disableProgressBar):
        with Cryostation(databasePath) as cryostation:
            country = cryostation[countryName]
            country['growth'] = {d: growthGaugeDataCountries[d][countryName] for d in growthGaugeDataCountries.keys()}
            cryostation[countryName] = country


def _appendGrowthToProvinces(growthGaugeDataProvinces, databasePath, countryName = 'US', disableProgressBar=True):
    provinceNameAll = list(growthGaugeDataProvinces['yesterday'].index)
    for stateName in tqdm(provinceNameAll.columns, disable=disableProgressBar):
        with Cryostation(databasePath) as cryostation:
            country = cryostation[countryName]
            province = country['provinces'][stateName]
            province['growth'] = {d: growthGaugeDataProvinces[d][stateName] for d in growthGaugeDataProvinces.keys()}
            country['provinces'][stateName] = province
            cryostation[countryName] = country


def computeGrowth(regionType = 'country',
                  countryName = None,
                  casesType = 'confirmed',
                  windowSize = WINDOW_SIZE,
                  disableProgressBar = True,
                  todayDate = TODAY_DATE,
                  databasePath = MASTER_DATABASE,
                  ):

    with Cryostation(databasePath) as cryostation:
        print('Loading time series for countries...')
        regions = cryostation.timeSeriesFor(regionType         = regionType,
                                              countryName        = countryName,
                                              casesType          = casesType,
                                              disableProgressBar = disableProgressBar,
                                              )

    growth = _computeGrowthFor(regions, windowSize = windowSize)

    growthGaugeData = _getGrowthGaugeData(growth, todayDate)

    print('Computing/writing growth factors...')
    if regionType == 'country':
        _appendGrowthToCountries(growthGaugeData, databasePath, disableProgressBar = disableProgressBar)
    elif regionType == 'province':
        _appendGrowthToProvinces(growthGaugeData, databasePath, countryName=countryName, disableProgressBar=True)
    else:
        raise ValueError(f'regionType = {regionType} not understood')
    print('Done.')


if __name__ == '__main__':
    computeGrowth(regionType = 'country', casesType = 'confirmed')
    computeGrowth(regionType = 'province', countryName = 'US', casesType='confirmed')
