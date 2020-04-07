import React, { useState, useEffect } from 'react';

import Plot from 'react-plotly.js';

import { Generic, Level, Button } from 'rbx';

import { US_STATES_WITH_ABBREVIATION } from '../constants';

export const CountyBarGraph = ({ statsForGraph, filterRegion }) => {
  const [alphaSort, setAlphaSort] = useState(false);

  const [plotsAsValues, setPlotsAsValues] = useState([]);

  const [minHeight, setMinHeight] = useState(0);

  const stateFromAbbreviation = (abbreviation) => {
    let fullStateName;
    for (const stateName of Object.keys(US_STATES_WITH_ABBREVIATION)) {
      if (US_STATES_WITH_ABBREVIATION[stateName] === abbreviation) {
        fullStateName = stateName;
      }
    }
    return fullStateName;
  };

  const config = {
    displayModeBar: false,
    responsive: true,
  };
  const layout = {
    title: stateFromAbbreviation(filterRegion),
    autosize: true,
    barmode: 'stack',
    margin: {
      l: 100,
      t: 50,
      r: 10,
    },
    xaxis: {
      fixedrange: true,
    },
    yaxis: {
      fixedrange: true,
    },
    paper_bgcolor: 'rgb(248,248,255)',
    plot_bgcolor: 'rgb(248,248,255)',
    legend: {
      xanchor: 'center',
      yanchor: 'top',
    },
  };

  useEffect(() => {
    if (statsForGraph) {
      setMinHeight(statsForGraph.length * 5);
      const sortedData = alphaSort
        ? statsForGraph.concat().sort((a, b) => b.region.localeCompare(a.region))
        : statsForGraph.concat().sort((a, b) => a.confirmed - b.confirmed);

      const confirmedPlot = {
        x: sortedData.map(((stat) => stat.confirmed)),
        y: sortedData.map(((stat) => stat.region)),
        name: 'Confirmed Cases',
        orientation: 'h',
        type: 'bar',
        showlegend: true,
        marker: {
          size: 3,
          color: 'rgba(20, 40, 180, 0.6)',
          width: 1,
        },
      };

      const deathsPlot = {
        x: sortedData.map(((stat) => stat.deaths)),
        y: sortedData.map(((stat) => stat.region)),
        name: 'Deaths',
        orientation: 'h',
        type: 'bar',
        showlegend: true,
        marker: {
          size: 3,
          color: 'rgba(255, 4, 30, 0.8)',
          width: 1,
        },
      };

      setPlotsAsValues([deathsPlot, confirmedPlot]);
    }
  }, [statsForGraph, alphaSort]);

  const changeAlphaSort = (selectedAlphaSort) => {
    setAlphaSort(selectedAlphaSort);
  };

  const AlphaOrByConfirmedButton = () => (
    <>
      { alphaSort && <Button size="medium" onClick={() => { changeAlphaSort(false); }}>Sort By Confirmed</Button> }
      { !alphaSort && <Button size="medium" onClick={() => { changeAlphaSort(true); }}>Sort Alphabetical</Button> }
    </>
  );

  return (
    <>

      <Level style={{
        marginBottom: 0, marginTop: 0, paddingTop: 0, paddinBottom: 0,
      }}
      >
        <Level.Item align="left">
          <AlphaOrByConfirmedButton />
        </Level.Item>
      </Level>
      <Generic tooltipPosition="top" tooltip="Clicking on legend items will remove them from graph">
        <Plot
          data={plotsAsValues}
          layout={layout}
          config={config}
          useResizeHandler
          style={{ width: '100%', height: '100%', minHeight: `${minHeight}rem` }}
        />
      </Generic>
    </>
  );
};

export default CountyBarGraph;
