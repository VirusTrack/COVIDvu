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
