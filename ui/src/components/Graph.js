import React, { useEffect, useState } from 'react'

import Plot from 'react-plotly.js'

import { Generic } from 'rbx'
import { useMobileDetect } from '../hooks/ui'

import LogoElement from './LogoElement'
import { GRAPHSCALE_TYPES } from '../constants'

export const Graph = ({
  graphName, data, y_type = 'numeric', y_title, x_title, selected, config, graphScale = GRAPHSCALE_TYPES.LINEAR, start = null, ref = null,
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

      if(graphScale === GRAPHSCALE_TYPES.SLOPE) {
          let totalDays = 0

          let slopeStart = 100


          // console.log(`graphName: ${graphName}`)
          if(graphName === 'Deaths') {
            slopeStart = 10
          }
          for (const key of Object.keys(regionData).sort()) {
            if(regionData[key] > slopeStart) {
              if(plots[normalizedRegion].x.length === 0) {
                plots[normalizedRegion].x.push(0)
              } else {
                const newX = plots[normalizedRegion].x[plots[normalizedRegion].x.length - 1] + 1
                if(totalDays < newX) totalDays = newX
                plots[normalizedRegion].x.push(newX)
              }
    
              plots[normalizedRegion].y.push(regionData[key])
            }
          }
    
    
          const slope_x = Array.apply(null, {length: totalDays}).map(Number.call, Number)
          const slope_y = slope_x.map(x => (slopeStart * Math.pow(10, Math.log10(1.3333) * (x))))
        
          plots['reproduction_rate'] = {
            order: 0,
            x: slope_x,
            y: slope_y,
            type: 'scatter',
            mode: 'lines',
            name: 'Daily Increase 33%',
            line: {
              color: 'black',
              dash: 'dash',
            },
            marker: {
              size: 5,
            },
            // showlegend: false,
            hoverinfo: 'skip',
          }
      } else {
        for (const key of Object.keys(regionData).sort()) {
          if ((graphScale === GRAPHSCALE_TYPES.LOGARITHMIC && regionData[key] > 100) || graphScale === GRAPHSCALE_TYPES.LINEAR) {
            if (start && regionData[key] < start) continue

            plots[normalizedRegion].x.push(key)
            plots[normalizedRegion].y.push(regionData[key])
          }
        }
      }
    }


    const sortedPlotsOrder = plotsOrder.sort((a, b) => b.total - a.total)

    for(const plot of Object.values(plots)) {
      for(let i=0; i<sortedPlotsOrder.length; i++) {
        if(plot.name === sortedPlotsOrder[i].region) {
          plot.order = graphScale === GRAPHSCALE_TYPES.SLOPE ? i + 1 : i
        }
      }      
    }
    console.dir(Object.values(plots).sort((a, b) => a.order - b.order))

    setPlotsAsValues(Object.values(plots).sort((a, b) => a.order - b.order))

  }, [selected, data, y_type, graphScale, start])

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
  }


  if (graphScale === GRAPHSCALE_TYPES.LOGARITHMIC || graphScale === GRAPHSCALE_TYPES.SLOPE) {
    layout.yaxis = {
      type: 'log',
      autorange: true,
    }
  }

  if (detectMobile.isMobile()) {
    layout = {
      ...layout,
      xaxis: {
        fixedrange: true,
      },
    }

    if (graphScale === GRAPHSCALE_TYPES.LINEAR) {
      layout = {
        ...layout,
        yaxis: {
          fixedrange: true,
        },
      }
    }
  }

  if (y_title) {
    layout = {
      ...layout,
      yaxis: { ...layout.yaxis, title: y_title },
    }
  }

  if (y_title === 'Case Fatality Rate Percentage') {
    layout.yaxis = { ...layout.yaxis, tickformat: '.1%' }
  }

  if (x_title) {
    layout.xaxis.title = x_title
  }

  layout.legend = {
    xanchor: 'center',
    yanchor: 'top',
    y: -0.1,
    x: 0.5,
  }

  // if(graphScale === GRAPHSCALE_TYPES.SLOPE) {
  //   layout['xaxis'] = {
  //     title: 'Days since 100 cases',
  //   }

  //   layout.legend = {
  //     ...layout.legend,
  //     yanchor: 'bottom',
  //     y: 1
  //   }
  
  // }  


  return (
    <>
      <Generic id="graphPlot" ref={ref} className="vt-graph" tooltipPosition="top" tooltip="Clicking on legend items will remove them from graph">
        <div className="vt-graph-logo"><LogoElement url /></div>
        <Plot
          data={plotsAsValues}
          layout={layout}
          config={mergeConfig}
          useResizeHandler
          style={{ width: '100%', height: '100%', minHeight: '45rem' }}
        />
      </Generic>
    </>
  )
}

export default Graph
