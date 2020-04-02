#!/bin/bash

# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:

from numpy import ndarray
from pandas.core.indexes.base import Index
from pandas.core.series import Series
from plotly.offline import init_notebook_mode
from typing import Union

import cufflinks as cf
import matplotlib.pyplot as plt
import numpy as np
import plotly.graph_objs as go


cf.go_offline(connected=False)
init_notebook_mode(connected=False)


def plotTimeSeries(x: Union[list, tuple, Series, ndarray],
                   y: Union[list, tuple, Series, ndarray],
                   name: Union[list, tuple, str],
                   yLabel: str,
                   color: Union[list, tuple, str],
                   title: str = None):
    """Make interactive time series plots

    Parameters
    ----------
    x: x-values. If iterable, will overlay plots
    y: y-values. If iterable, will overlay plots
    name: Name(s) of the object(s) for the legend
    color: Color(s) of the object(s)
    yLabel: y-axis label
    title: Plot title

    Returns
    -------
    A plotly interactive plot of the input time series
    """

    fig = go.Figure(layout={"title": title,
                            "yaxis_title": yLabel,
                            "legend": {"itemsizing": "constant"},
                            "hovermode": "x"
                            }
                    )
    if isinstance(x, (list, tuple)) and isinstance(y, (list, tuple)) and isinstance(name, (list, tuple)):
        for i, values in enumerate(zip(x, y)):
            xi, yi = values
            fig.add_trace(go.Scatter(x    = xi,
                                     y    = yi,
                                     mode = "lines",
                                     name = name[i],
                                     line = dict(color=color[i]),
                                     )
                          )
        return fig
    # single time series
    elif isinstance(x, (Series, ndarray, Index)) and isinstance(y, (Series, ndarray)) and isinstance(name, str):
        fig.add_trace(go.Scatter(x    = x,
                                 y    = y,
                                 mode = "lines",
                                 name = name,
                                 line = dict(color=color)
                                 )
                      )
        return fig
    else:
        raise Exception('Invalid arguments')


def plotTimeSeriesInteractive(df,
                              selectedColumns,
                              log = False,
                              **kwargs
                              ):
    """

    Parameters
    ----------
    df: A dataframe where the index is time and columns are distinct time series to plot
    selectedColumns: The columns of the dataframe to plot
    log: If True, displays Log10(df + 1)
    **kwargs: Non-widget arguments
        - yLabel: The y-axis label
        - title: The title of the plot (optional)
        - cmapName: The name of the matplotlib colormap (optional)


    Returns
    -------
    A plotly plot of the selected time series
    """

    yLabel = kwargs.get("yLabel")
    assert yLabel
    title = kwargs.get("title")
    cmapName = kwargs.get("cmapName")


    if isinstance(selectedColumns, str):
        selectedColumns = [selectedColumns]
        nvalues = 1
    elif isinstance(selectedColumns, tuple):
        selectedColumns = list(selectedColumns)
        nvalues = len(list(selectedColumns))
    elif isinstance(selectedColumns, list):
        nvalues = len(selectedColumns)
    else:
        print('No columns selected')
        return 
    df = df[selectedColumns]

    if cmapName is None:
        cm = plt.get_cmap("nipy_spectral")
    else:
        cm = plt.get_cmap(cmapName)

    if nvalues > 1:
        cols = cm(np.arange(0, nvalues+1, nvalues/(nvalues-1))/nvalues)
    else:
        cols = cm(0.5)
    if log:
        yLabel = "Log10 " + yLabel

    fig = go.Figure(layout={"yaxis_title": yLabel,
                            "legend": {"itemsizing": "constant"},
                            "hovermode": "x",
                            # "template": "plotly_dark"
                            })

    for ii, columnName in enumerate(selectedColumns):
        df_this_country = df[columnName]

        xvals = df_this_country.index
        yvals = df_this_country.values

        if log:
            yvals = np.log10(yvals + 1)

        if nvalues > 1:
            color = f'rgba({cols[ii][0]},{cols[ii][1]},{cols[ii][2]},{cols[ii][3]})'
        else:
            color = f'rgba({cols[0]},{cols[1]},{cols[2]},{cols[3]})'
        fig.add_trace(
            go.Scatter(x          = xvals,
                       y          = yvals,
                       name       = columnName,
                       line       = dict(color=color),
                       showlegend = True,
                       mode       = "lines+markers",
                       marker={"size": 5},
                       )
        )

    fig.update_layout(title_text=title)

    return fig



def plot(nRows=1, nCols=1, figSize=5):
    """
    Generate a matplotlib plot and axis handle

    Parameters
    -----------------
    nRows : An int, number of rows for subplotting
    nCols : An int, number of columns for subplotting
    figSize : Numeric or array (xFigSize, yFigSize). The size of each axis.
    """
    if isinstance(figSize, (list, tuple)):
        xFigSize, yFigSize = figSize
    elif isinstance(figSize, (int, float)):
        xFigSize = yFigSize = figSize
    else:
        raise Exception('figSize type {} not recognised'.format(type(figSize)))

    fig, axs = plt.subplots(nRows, nCols, figsize=(nCols * xFigSize, nRows * yFigSize))
    if nRows * nCols > 1:
        axs = axs.ravel()
    return fig, axs


def plotPrediction(data, meanPredictionTS, percentilesTS, countryName, log=False):
    fig, ax = plot()
    if log:
        data             = np.log10(data)
        meanPredictionTS = np.log10(meanPredictionTS + 1)
        percentilesTS    = np.log10(percentilesTS + 1)
    meanPredictionTS.plot(ax=ax, linestyle='-.', color='black', label='Mean Prediction')
    data.plot(ax=ax, marker='o', color='green', label='Data')
    ax.fill_between(meanPredictionTS.index,
                    percentilesTS['97.5'],
                    percentilesTS['2.5'],
                    color='red',
                    alpha=0.1,
                    label=r"95% CI",
                    )

    ax.fill_between(meanPredictionTS.index,
                    percentilesTS['75'],
                    percentilesTS['25'],
                    color='red',
                    alpha=0.5,
                    label=r"50% CI",
                    )

    if log:
        ax.set_ylabel('Log10 Total confirmed cases')
    else:
        ax.set_ylabel('Total confirmed cases')
    ax.set_title(countryName)
    ax.legend(loc='upper left')
    return fig, ax


def hexToRGB(h):
    return tuple(int(h.lstrip('#')[i:i + 2], 16) for i in (0, 2, 4))


def castHexToRGBA_string(h, alpha):
    assert isinstance(h, str)
    if not h[0] == '#':
        raise ValueError(f'{h} not hexadecimal')
    color = list(hexToRGB(h))
    color.append(alpha)
    return f'rgba{str(tuple(color))}'


def plotWithCI(data, percentilesTS, meanPredictionTS, countryName, color_data, color_conf, fig = None):
    if fig is None:
        fig = go.Figure(layout={"yaxis_title": 'Total confirmed cases',
                                "legend": {"itemsizing": "constant"},
                                "hovermode": "x",
                                })
    fig.add_trace(
        go.Scatter(x=data.index,
                   y=data,
                   name=countryName,
                   line=dict(color=color_data),
                   showlegend=True,
                   mode="lines+markers",
                   marker={"size": 5},
                   )
    )

    fig.add_trace(
        go.Scatter(x=percentilesTS.index,
                   y=percentilesTS['2.5'],
                   line_color=color_conf[0],
                   mode="lines",
                   name="Lower",
                   fill=None,
                   showlegend=True,
                   #hoverinfo='skip',
                   )
    )
    fig.add_trace(
        go.Scatter(x=percentilesTS.index,
                   y=percentilesTS['97.5'],
                   line_color=color_conf[0],
                   mode="lines",
                   fill='tonexty',
                   name="Upper",
                   showlegend=True,
                   #hoverinfo='skip',
                   )
    )

    fig.add_trace(
        go.Scatter(x=percentilesTS.index,
                   y=percentilesTS['25'],
                   line_color=color_conf[1],
                   mode="lines",
                   name="25%",
                   fill=None,
                   showlegend=False,
                   hoverinfo='skip',
                   )
    )
    fig.add_trace(
        go.Scatter(x=percentilesTS.index,
                   y=percentilesTS['75'],
                   line_color=color_conf[1],
                   mode="lines",
                   fill='tonexty',
                   name="75%",
                   showlegend=False,
                   hoverinfo='skip',
                   )
    )
    fig.add_trace(
        go.Scatter(x=meanPredictionTS.index,
                   y=meanPredictionTS,
                   name="Mean",
                   line=dict(color=color_data,
                             dash='dash',
                             ),
                   showlegend=True,
                   mode="lines",
                   marker={"size": 5},
                   )
    )

    fig.update_layout(showlegend=True)

    return fig


def plotDataAndPredictionsWithCI(meanPredictionTSAll,
                                 confirmedCasesAll,
                                 percentilesTSAll,
                                 selectedColumns=None,
                                 log=False,
                                 **kwargs,
                                 ):
    yLabel     = kwargs.get("yLabel", 'Total confirmed cases')
    cmapName   = kwargs.get("cmapName")
    title      = kwargs.get('title', 'COVID-19 predictions for total confirmed cases')
    plotSingle = kwargs.get('plotSingle', False)

    if cmapName is None:
        cm = plt.get_cmap("nipy_spectral")
    else:
        cm = plt.get_cmap(cmapName)
    if isinstance(selectedColumns, str):
        selectedColumns = [selectedColumns]
        nvalues = 1
    elif isinstance(selectedColumns, tuple):
        selectedColumns = list(selectedColumns)
        nvalues = len(list(selectedColumns))
    elif isinstance(selectedColumns, list):
        nvalues = len(selectedColumns)
    elif selectedColumns is None:
        assert plotSingle
    else:
        raise ValueError

    if nvalues > 1:
        cols = cm(np.arange(0, nvalues + 1, nvalues / (nvalues - 1)) / nvalues)
    else:
        cols = cm(0.5)

    if log:
        yLabel =  "Log10 " + yLabel

    fig = go.Figure(layout={"yaxis_title": yLabel,
                            "legend": {"itemsizing": "constant"},
                            "hovermode": "x",
                            # "template": "plotly_dark"
                            })

    if plotSingle:
        meanPrediction = meanPredictionTSAll
        confirmedCases = confirmedCasesAll
        percentilesTS = percentilesTSAll
        countryName = kwargs.get('countryName')
        colorData = f'rgba({cols[0]},{cols[1]},{cols[2]},{cols[3]})'
        colorCI = (f'rgba({cols[0]},{cols[1]},{cols[2]},{0.1})',
                   f'rgba({cols[0]},{cols[1]},{cols[2]},{0.5})',
                   )
        fig = plotWithCI(confirmedCases,
                         percentilesTS,
                         meanPrediction,
                         countryName, colorData, colorCI,
                         fig=fig,
                         )
    else:
        meanPredictionTSSelected = meanPredictionTSAll[selectedColumns]
        confirmedCasesAllSelected = confirmedCasesAll[selectedColumns]
        percentilesTSAllSelected = percentilesTSAll.loc[:, (slice(None), selectedColumns)]
        for ii, countryName in enumerate(selectedColumns):
            meanPredictionTSThisCountry = meanPredictionTSSelected[countryName]
            percentilesTSThisCountry = percentilesTSAllSelected.xs(countryName, level=1, axis=1)
            confirmedCasesThisCountry = confirmedCasesAllSelected[countryName]

            if nvalues > 1:
                colorData = f'rgba({cols[ii][0]},{cols[ii][1]},{cols[ii][2]},{cols[ii][3]})'
                colorCI = (f'rgba({cols[ii][0]},{cols[ii][1]},{cols[ii][2]},{0.1})',
                           f'rgba({cols[ii][0]},{cols[ii][1]},{cols[ii][2]},{0.5})',
                           )
            else:
                colorData = f'rgba({cols[0]},{cols[1]},{cols[2]},{cols[3]})'
                colorCI = (f'rgba({cols[0]},{cols[1]},{cols[2]},{0.1})',
                           f'rgba({cols[0]},{cols[1]},{cols[2]},{0.5})',
                           )

            fig = plotWithCI(confirmedCasesThisCountry,
                             percentilesTSThisCountry,
                             meanPredictionTSThisCountry,
                             countryName, colorData, colorCI,
                             fig=fig,
                             )


    if log:
        fig.update_layout(title_text=title, yaxis_type = "log")
    else:
        fig.update_layout(title_text=title)
    return fig
