#!/bin/bash

# See: https://github.com/VirusTrack/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


from IPython import get_ipython


def computeGlobal(df, globalName='!Global'):
    globalCases      = df.sum(axis=1)
    globalCases.name = globalName
    df[globalName]   = globalCases
    df = df.reindex(sorted(df.columns), axis=1)
    return df


def computeCasesOutside(df, censoredCountries, censoredCountriesName):
    censored                  = df.loc[:, ~df.columns.isin(censoredCountries)].sum(axis=1)
    censored.name             = censoredCountriesName
    df[censoredCountriesName] = censored
    df                        = df.reindex(sorted(df.columns), axis=1)
    return df


def autoReloadCode():
    """
    Let python functions be updated whilst inside an iPython/Jupyter session
    """
    ipython = get_ipython()
    ipython.magic("reload_ext autoreload")
    ipython.magic("autoreload 2")
