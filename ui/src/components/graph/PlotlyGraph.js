import React from 'react'

import Plot from 'react-plotly.js'

import { Generic } from 'rbx'

import LogoElement from '../LogoElement'

export const PlotlyGraph = ({
    data, layout, config, ref = null
}) => {

    return (
        <>
          <Generic id="graphPlot" ref={ref} className="vt-graph" tooltipPosition="top" tooltip="Clicking on legend items removes others from plot ">
            <div className="vt-graph-logo"><LogoElement url /></div>
            <Plot
              data={data}
              layout={layout}
              config={config}
              useResizeHandler
              style={{ width: '100%', height: '100%', minHeight: '45rem' }}
            />
          </Generic>
        </>
      )
}

export default PlotlyGraph