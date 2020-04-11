#!/usr/bin/env python3
# See: https://github.com/VirusTrack/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


from tinydb import TinyDB, Query
from tqdm.auto import tqdm

import pandas as pd


# --- constants ---

DEFAULT_TABLE = 'virustrack'


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


    # +++ ontological methods +++

    def allCountryNames(self):
        return [countryName for countryName in self.keys() if '!' not in countryName]


    def allProvincesOf(self, countryName = 'US'):
        if 'provinces' not in self[countryName]:
            raise KeyError

        return [provinceName for provinceName in self[countryName]['provinces'].keys() if '!' not in provinceName]


    def timeSeriesFor(self, regionType = 'country', casesType = 'confirmed', countryName = None, disableProgressBar = True):
        """Get all time series of a given region type and return as dataframe

        Parameters
        ----------
        regionType: 'country' or 'province'
        casesType: 'confirmed' or 'deaths'
        countryName: if regionType == 'province', the country for which to get
                     all provinces
        disableProgressBar: no need for a progress bar on a service object - 
                            enable as needed if internal progress report is
                            needed, but should be off by default.

        Returns
        -------
        Time series for all regions of type regionType, as a pandas dataframe
        """
        if regionType == 'country':
            regions = self.allCountryNames()
        elif regionType == 'province':
            assert countryName
            regions = self.allProvincesOf(countryName)
        else:
            raise ValueError(f'regionType = {regionType} not understood')

        df = {}
        for region in tqdm(regions, disable = disableProgressBar):
            if regionType == 'country':
                if casesType in self[region]:
                    df[region] = pd.Series(self[region][casesType])
            elif regionType == 'province':
                if casesType in self[countryName]['provinces'][region]:
                    df[region] = pd.Series(self[countryName]['provinces'][region][casesType])

        df = pd.DataFrame(df)
        df.index = pd.to_datetime(df.index)
        df.fillna(0, inplace=True)

        return df

