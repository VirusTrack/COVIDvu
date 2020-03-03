from pandas.core.series import Series
from numpy import ndarray
from typing import Union
from plotly.offline import init_notebook_mode
import plotly.graph_objs as go
import cufflinks as cf

cf.go_offline(connected=False)
init_notebook_mode(connected=False)


def plotMultipleTimeSeries(x: Union[list, tuple, Series, ndarray],
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
    if isinstance(x, (list, tuple)) and isinstance(y, (list, tuple)) and isinstance(
            name, (list, tuple)):  # multiple time series
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
    elif isinstance(name, str):  # single time series
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
