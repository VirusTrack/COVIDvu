import React, { useEffect, useState } from 'react'

import { useMobileDetect } from '../hooks/ui'

import PlotlyGraph from './graph/PlotlyGraph'

import { GRAPHSCALE_TYPES } from '../constants'

import moment from 'moment'

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
      } else if(graphScale === GRAPHSCALE_TYPES.AVERAGE) {
        const diff = Object.values(regionData).reduce((acc, value, index, array) => {
          acc.push(acc.length === 0 ? value : value - array[index - 1])
          return acc
        }, [])

        let index = 0
        for (const key of Object.keys(regionData).sort()) {
          plots[normalizedRegion].x.push(key)
          plots[normalizedRegion].y.push(diff[index])

          ++index
        }

        plots[normalizedRegion].type = 'bar'

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

    if(graphScale === GRAPHSCALE_TYPES.AVERAGE) {

      let earliestDay = undefined
      let latestDay = undefined

      for(const plot of Object.values(plots)) {

        const plotBeginDate = moment(plot.x[0])
        const plotEndDate = moment(plot.x[plot.x.length - 1])

          if(!earliestDay) {
            earliestDay = plotBeginDate
            latestDay = plotEndDate
          } else {
            if(earliestDay.isBefore(plotBeginDate)) {
              earliestDay = plotBeginDate
            }
            if(latestDay.isAfter(plotEndDate)) {
              latestDay = plotEndDate
            }
          }
      }

      if(earliestDay && latestDay) {
          // console.dir(earliestDay.format('YYYY-MM-DD'))
          // console.dir(latestDay.format('YYYY-MM-DD'))

          const diffInDays = latestDay.diff(earliestDay, 'days') + 1

          const x_axis_days = []
          const y_totals = []

          const total_plots = Object.values(plots).length
          let currentDayKey = moment(earliestDay).format('YYYY-MM-DD')

          for(let i=0; i<diffInDays; i++) {
            currentDayKey = moment(earliestDay).add(i, 'days').format('YYYY-MM-DD')

            x_axis_days.push(currentDayKey)

            let y_total = 0

            for(let plot of Object.values(plots)) {
              let y_vals = Object.values(plot.y)
              y_total += y_vals[i]
            }

            y_total = y_total / total_plots
            y_totals.push(y_total)
          }

          // console.dir(x_axis_days)
          // console.dir(y_totals)

          const movingAverage = y_totals.reduce((acc, value, index, array) => {
            const howMany = index < 7 ? index : 7

            let sum = 0
            for(let i = index - howMany ; i<index; i++) {
              sum += array[i]
            }

            acc.push(sum / howMany)
            return acc
          }, [])

          plots['rolling_average'] = {
            order: 0,
            x: x_axis_days,
            y: movingAverage,
            type: 'scatter',
            mode: 'lines',
            name: '7-Day Average',
            line: {
              color: 'black',
              width: 3,
            },
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

    setPlotsAsValues(Object.values(plots).sort((a, b) => a.order - b.order))

  }, [selected, data, y_type, graphScale, start, graphName])

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

  if (graphName === 'Mortality') {
    layout.yaxis = { ...layout.yaxis, tickformat: '.1%' }
  }

  if (x_title) {
    layout.xaxis.title = x_title
  }

  layout.legend = {
    xanchor: 'center',
    yanchor: 'top',
    y: -0.2,
    x: 0.5,
    orientation: "h",
    itemclick: 'toggleothers'
  }

  if(graphScale === GRAPHSCALE_TYPES.SLOPE) {
    layout['xaxis'] = {
      title: 'Days since 100 cases',
    }

    layout.legend = {
      ...layout.legend,
    }
  
  }  

  return (
    <PlotlyGraph data={plotsAsValues} layout={layout} config={mergeConfig} ref={ref} />
  )
}

export default Graph
