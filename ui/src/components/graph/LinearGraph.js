import React, { useEffect, useState } from 'react'

import { useMobileDetect } from '../../hooks/ui'

import PlotlyGraph from './PlotlyGraph'

export const LinearGraph = ({
  graphName, data, y_title, x_title, selected, config, start = null, ref = null,
}) => {
  const [plotsAsValues, setPlotsAsValues] = useState([])

  const detectMobile = useMobileDetect()

  useEffect(() => {
    const plots = {}

    const selectedData = Object.keys(data).filter((entry) => selected.indexOf(entry) !== -1)

    const plotsOrder = []

    for (const region of selectedData) {

      const dataLength = Object.values(data[region]).length
      
      plotsOrder.push({
        region: region,
        total: Object.values(data[region])[dataLength-1]
      })

      const normalizedRegion = region.startsWith('!') ? region.substring(1) : region
      plots[normalizedRegion] = {
        x: [],
        y: [],
        type: 'scatter',
        mode: 'lines+markers',
        name: normalizedRegion,
        showlegend: true,
        marker: {
          size: 5,
        },
      }

      const regionData = data[region]

        for (const key of Object.keys(regionData).sort()) {
            if (start && regionData[key] < start) continue

            plots[normalizedRegion].x.push(key)
            plots[normalizedRegion].y.push(regionData[key])
        }
      
    }

    const sortedPlotsOrder = plotsOrder.sort((a, b) => b.total - a.total)

    for(const plot of Object.values(plots)) {
      for(let i=0; i<sortedPlotsOrder.length; i++) {
        if(plot.name === sortedPlotsOrder[i].region) {
          plot.order = i
        }
      }      
    }

    setPlotsAsValues(Object.values(plots).sort((a, b) => a.order - b.order))

  }, [selected, data, start, graphName])

  const mergeConfig = {
    ...config,
    displayModeBar: false,
    responsive: true,
  }

  let layout = {
    autosize: true,
    width: undefined,
    height: undefined,
    margin: {
        l: 70,
        t: 5,
        r: 10,
    },
    legend: {
        xanchor: 'center',
        yanchor: 'top',
        y: -0.2,
        x: 0.5,
        orientation: "h",
        itemclick: 'toggleothers'
    }    
  }

  if (detectMobile.isMobile()) {
    layout = {
      ...layout,
      xaxis: {
        fixedrange: true,
      },
      yaxis: {
        fixedrange: true,
      },
    }
  }

  if (y_title) {
    layout = {
      ...layout,
      yaxis: { ...layout.yaxis, title: y_title },
    }
  }

  if (x_title) {
    layout.xaxis.title = x_title
  }


  return (
    <PlotlyGraph data={plotsAsValues} layout={layout} config={mergeConfig} ref={ref} />
  )
}

export default LinearGraph
