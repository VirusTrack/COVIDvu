#!/usr/bin/env python3
# See: https://github.com/VirusTrack/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


import pandas as pd
from tinydb import TinyDB, Query
from tqdm.auto import tqdm


# --- constants ---

DEFAULT_TABLE = 'virustrack'

# *** functions ***
def getCountries(databasePath):
    with Cryostation(databasePath) as storage:
        countries = []
        for c in [k for k in storage.keys()]:
            if c[0] != '!':
                countries.append(c)
    return countries


def getProvinces(databasePath, country = 'US'):
    with Cryostation(databasePath) as storage:
        provinces = []
        for s in [p for p in storage[country]['provinces'].keys()]:
            if s[0] != '!':
                provinces.append(s)
    return provinces


def getAllTimeSeriesAsDataFrame(databasePath, regionType = 'country', target = 'confirmed', provinceCountry = None):
    """Get all time series of a given region type and return as dataframe

    Parameters
    ----------
    databasePath: Path to database
    regionType: 'country' or 'province'
    target: 'confirmed' or 'deaths'
    provinceCountry: if regionType == 'province', the country for which to get all provinces

    Returns
    -------
    Time series for all regions of type regionType, as a pandas dataframe
    """
    if regionType == 'country':
        regions = getCountries(databasePath)
    elif regionType == 'province':
        assert provinceCountry
        regions = getProvinces(databasePath, country = provinceCountry)
    else:
        raise ValueError(f'regionType = {regionType} not understood')

    df = {}
    with Cryostation(databasePath) as storage:
        for region in tqdm(regions):
            if regionType == 'country':
                if target in storage[region]:
                    df[region] = pd.Series(storage[region][target])
            elif regionType == 'province':
                if target in storage[provinceCountry]['provinces'][region]:
                    df[region] = pd.Series(storage[provinceCountry]['provinces'][region][target])
    df = pd.DataFrame(df)
    df.index = pd.to_datetime(df.index)
    df.fillna(0, inplace=True)
    return df

# *** classes and objects ***

class Cryostation(object):
    # *** private ***


    # *** public ***

    def __init__(self,
                 databasePath,
                 table = DEFAULT_TABLE):
        self._databasePath = databasePath
        self._storage      = TinyDB(self._databasePath, default_table = table)


    def __del__(self):
        if self._storage:
            self._storage.close()
            self._storage = None


    def close(self):
        self.__del__()


    def __setitem__(self, index, document):
        Record = Query()

        self._storage.upsert(document, Record.key == index)


    def get(self, index, default = None):
        Record = Query()
        result = self._storage.get(Record.key == index)

        if not result:
            if default == None:
                raise IndexError
            else:
                result = default

        return result


    def __getitem__(self, index):
        return self.get(index)


    def __contains__(self, key):
        Record = Query()

        result = self._storage.contains(Record.key == key)

        return result


    def items(self):
        return ( (item['key'], item) for item in self._storage.all() )


    def keys(self):
        return (key for (key, value) in self.items())


    def __enter__(self):
        return self


    def __exit__(self, exceptionType, exceptionValue, traceback):
        self.close()

