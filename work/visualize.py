from ipywidgets import widgets
from ipywidgets import interact
from ipywidgets import fixed
from ipywidgets import interact_manual
from pandas.core.series import Series
from pandas.core.indexes.base import Index
from numpy import ndarray
from typing import Union
from plotly.offline import init_notebook_mode
import plotly.graph_objs as go
import cufflinks as cf
import numpy as np
import pandas as pd

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
            fig.add_trace(go.Scatter(x=xi,
                                     y=yi,
                                     mode="lines",
                                     name=name[i],
                                     line=dict(color=color[i]),
                                     )
                          )
        return fig
    # single time series
    elif isinstance(x, (Series, ndarray, Index)) and isinstance(y, (Series, ndarray)) and isinstance(name, str):
        fig.add_trace(go.Scatter(x=x,
                                 y=y,
                                 mode="lines",
                                 name=name,
                                 line=dict(color=color)
                                 )
                      )
        return fig
    else:
        raise Exception('Invalid arguments')

# TODO
colours = ['red', 'blue', 'green', 'orange']
def plotMultipleTimeSeriesDropdown(df,
                                   dropDownValues,
                                   log=False,
                                   **kwargs
                                   ):
    """

    Parameters
    ----------
    df: A dataframe where the index are distinct time series to plot, and names are displayed as buttons.
        Columns are dates or times.
    yLabel: Axis label of the y-axis
    titleLeft: The string to the left of the name of the time series in the title
    titleRight: The string to the right of the name of the time series in the title
    color: Color of the time series

    Returns
    -------
    A plotly plot where buttons are rows of df, and each row corresponds to a time series.
    """

    #     if name_2:
    #         name = name_2

    ylabel = kwargs.get("y_label", "Total daily count")
    color = kwargs.get("colour", "red")

    # filter out name we want
    try:
        df = df[list(dropDownValues)]
    except KeyError:
        print(f"No countries {dropDownValues}. Did you know mitochondria have their own DNA?")
        return

    fig = go.Figure(layout={"yaxis_title": ylabel,
                            "legend": {"itemsizing": "constant"},
                            "hovermode": "x",
                            #"template": "plotly_dark"
                            })

    for ii, country_name in enumerate(dropDownValues):
        df_this_country = df[country_name]

        xvals = df_this_country.index
        yvals = df_this_country.values

        if log:
            yvals = np.log10(yvals + 1)
            ylabel = "log 10 " + ylabel

        fig.add_trace(
            go.Scatter(x=xvals,
                       y=yvals,
                       name=country_name,
                       line=dict(color=colours[ii]),
                       showlegend=True,
                       mode="lines+markers",
                       marker={"size": 5})
        )

    fig.update_layout(title_text=ylabel)

    return fig


# def plotMultipleTimeSeriesDropdown(df,
#                                    yLabel='',
#                                    titleLeft='',
#                                    titleRight='',
#                                    color='#690415',
#                                    ):
#     """
#
#     Parameters
#     ----------
#     df: A dataframe where the index are distinct time series to plot, and names are displayed as buttons.
#         Columns are dates or times.
#     yLabel: Axis label of the y-axis
#     titleLeft: The string to the left of the name of the time series in the title
#     titleRight: The string to the right of the name of the time series in the title
#     color: Color of the time series
#
#     Returns
#     -------
#     A plotly plot where buttons are rows of df, and each row corresponds to a time series.
#     """
#     names = list(df.index)
#
#     fig = go.Figure(layout={"yaxis_title": yLabel,
#                             "legend": {"itemsizing": "constant"},
#                             "hovermode": "x"
#                             })
#
#     buttonsList = []
#     for i, name in enumerate(names):
#         singleTS = df.loc[name]
#         if i == 0:
#             fig.add_trace(
#                 go.Scatter(x=singleTS.index,
#                            y=singleTS,
#                            name=name,
#                            line=dict(color=color))
#             )
#
#         else:
#             fig.add_trace(
#                 go.Scatter(x=singleTS.index,
#                            y=singleTS,
#                            name=name,
#                            visible=False,
#                            line=dict(color=color))
#             )
#
#         appearance = [False] * len(names)
#         appearance[i] = True
#         buttonsList.append(dict(label=name,
#                                 method="update",
#                                 args=[{"visible": appearance},
#                                       {"title": titleLeft+name+titleRight,
#                                        }]
#                                 )
#                            )
#
#     fig.update_layout(
#         updatemenus=[
#             dict(
#                 active=0,
#                 buttons=buttonsList,
#             )
#         ])
#
#     fig.update_layout(title_text=titleLeft+names[0]+titleRight)
#
#     return fig
