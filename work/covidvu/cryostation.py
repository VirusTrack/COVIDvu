#!/usr/bin/env python3
# See: https://github.com/VirusTrack/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


from tinydb import TinyDB, Query


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

