import React, { useEffect, useState } from 'react'

import { useMobileDetect } from '../../hooks/ui'

import PlotlyGraph from './PlotlyGraph'

export const SlopeGraph = ({
    graphName,
    data,
    selected,
    config,
    start = null,
    ref = null,
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
    
            let totalDays = 0

            let slopeStart = 100

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
          }
    
        const sortedPlotsOrder = plotsOrder.sort((a, b) => b.total - a.total)
    
        for(const plot of Object.values(plots)) {
          for(let i=0; i<sortedPlotsOrder.length; i++) {
            if(plot.name === sortedPlotsOrder[i].region) {
              plot.order =  i + 1
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
        yaxis: {
            type: 'log',
            autorange: true,
        },
        xaxis: {
            title: 'Days since 100 cases',
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
        
    if (detectMobile.isMobile() || detectMobile.isIos()) {
      layout = {
        ...layout,
        xaxis: {
          fixedrange: true
        },
        yaxis: {
          fixedrange: true
        }
      }
    }
        

    return (
        <PlotlyGraph data={plotsAsValues} layout={layout} config={mergeConfig} ref={ref} />
      )
    
}

export default SlopeGraph
