def computeGlobal(df, globalName='!Global'):
    globalCases = df.sum(axis=0)
    globalCases.name = globalName
    df = df.append(globalCases)
    df.sort_index(inplace=True)
    return df


def computeCasesOutside(df, censoredCountries, censoredCountriesName):
    censored = df[~df.index.isin(censoredCountries)].sum(axis=0)
    censored.name = censoredCountriesName
    df = df.append(censored)
    df.sort_index(inplace=True)
    return df

