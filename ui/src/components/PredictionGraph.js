import React, { useEffect, useState } from 'react'

import Plot from 'react-plotly.js'


import { Generic, Notification, Title } from 'rbx'


import numeral from 'numeral'
import moment from 'moment'
import LogoElement from './LogoElement'
import { useMobileDetect } from '../hooks/ui'
import { GRAPHSCALE_TYPES } from '../constants'

export const PredictionGraph = ({
  title, predictions, confirmed, selected, graphScale = GRAPHSCALE_TYPES.LINEAR,
}) => {
  const [plotsAsValues, setPlotsAsValues] = useState([])

  const detectMobile = useMobileDetect()

  const [upper, setUpper] = useState(0)
  const [lower, setLower] = useState(0)

  const today = moment()

  useEffect(() => {
    if (Object.keys(predictions).length > 0 && Object.keys(confirmed).length > 0) {
      const plots = {}
      const plots_2_5 = {}
      const plots_25 = {}
      const plots_97_5 = {}
      const plots_75 = {}
      const plots_mean = {}

      const selectedData = Object.keys(confirmed).filter((entry) => selected.indexOf(entry) !== -1)

      let plotList = []
      for (const region of selectedData) {
        const normalizedRegion = region.startsWith('!') ? region.substring(1) : region
        plots[normalizedRegion] = {
          x: [],
          y: [],
          type: 'scatter',
          mode: 'lines+markers',
          name: normalizedRegion,
          showlegend: true,
          marker: {
            color: 'green',
            size: 5,
          },
        }
        plots_2_5[normalizedRegion] = {
          x: [],
          y: [],
          line: {
            color: '#17BECF',
          },
          type: 'scatter',
          mode: 'lines',
          name: 'Lower',
          showlegend: false,
        }
        plots_97_5[normalizedRegion] = {
          x: [],
          y: [],
          line: {
            color: '#17BECF',
          },
          type: 'scatter',
          mode: 'lines',
          fill: 'tonexty',
          name: 'Upper',
          showlegend: false,
        }
        plots_25[normalizedRegion] = {
          x: [],
          y: [],
          line: {
            color: '#17BECF',
          },
          type: 'scatter',
          mode: 'lines',
          name: '25%',
          fill: null,
          showlegend: false,
          hoverinfo: 'skip',
        }
        plots_75[normalizedRegion] = {
          x: [],
          y: [],
          line: {
            color: '#179090',
          },
          type: 'scatter',
          mode: 'lines',
          fill: 'tonexty',
          name: '75%',
          showlegend: false,
          hoverinfo: 'skip',

        }
        plots_mean[normalizedRegion] = {
          x: [],
          y: [],
          type: 'scatter',
          mode: 'lines',
          name: 'Mean',
          line: {
            color: 'green',
            dash: 'dash',
          },
          marker: {
            size: 5,
          },
          showlegend: true,
        }

        const regionData = confirmed[region]
        for (const key of Object.keys(regionData).sort()) {
          if ((graphScale === GRAPHSCALE_TYPES.LOGARITHMIC && regionData[key] > 100) || graphScale === GRAPHSCALE_TYPES.LINEAR) {
            plots[normalizedRegion].x.push(key)
            plots[normalizedRegion].y.push(regionData[key])
          }
        }

        if (Object.prototype.hasOwnProperty.call(predictions, region)) {
          for (const key of Object.keys(predictions[region].confidenceInterval['2.5'])) {
            if (moment(key).isSameOrAfter(today, 'day')) {
              if (moment(key).isSame(today, 'day')) {
                setLower(predictions[region].confidenceInterval['2.5'][key])
              }

              plots_2_5[normalizedRegion].x.push(key)
              plots_2_5[normalizedRegion].y.push(predictions[region].confidenceInterval['2.5'][key])
            }
          }
          for (const key of Object.keys(predictions[region].confidenceInterval['97.5'])) {
            if (moment(key).isSameOrAfter(today, 'day')) {
              if (moment(key).isSame(today, 'day')) {
                setUpper(predictions[region].confidenceInterval['97.5'][key])
              }
              plots_97_5[normalizedRegion].x.push(key)
              plots_97_5[normalizedRegion].y.push(predictions[region].confidenceInterval['97.5'][key])
            }
          }
          for (const key of Object.keys(predictions[region].confidenceInterval['25'])) {
            if (moment(key).isSameOrAfter(today, 'day')) {
              plots_25[normalizedRegion].x.push(key)
              plots_25[normalizedRegion].y.push(predictions[region].confidenceInterval['25'][key])
            }
          }
          for (const key of Object.keys(predictions[region].confidenceInterval['75'])) {
            if (moment(key).isSameOrAfter(today, 'day')) {
              plots_75[normalizedRegion].x.push(key)
              plots_75[normalizedRegion].y.push(predictions[region].confidenceInterval['75'][key])
            }
          }
          for (const key of Object.keys(predictions[region].mean)) {
            if (moment(key).isSameOrAfter(today, 'day')) {
              plots_mean[normalizedRegion].x.push(key)
              plots_mean[normalizedRegion].y.push(predictions[region].mean[key])
            }
          }

          plotList = [...plotList,
            ...Object.values(plots),
            ...Object.values(plots_2_5),
            ...Object.values(plots_97_5),
            ...Object.values(plots_25),
            ...Object.values(plots_75),
            ...Object.values(plots_mean)]
        }

        setPlotsAsValues(plotList)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, predictions])

  const mergeConfig = {
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

  if (graphScale === GRAPHSCALE_TYPES.LOGARITHMIC) {
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

  layout.legend = {
    xanchor: 'center',
    yanchor: 'top',
    y: -0.1,
    x: 0.5,
  }

  return (
    <>
      <Notification>
        <Title size={4}>
          Predictions for Today {today.format('YYYY-MM-DD')}
          &nbsp;in&nbsp;{title}
        </Title>
        Between&nbsp;<em>{numeral(lower).format('0,0')}</em>&nbsp;and&nbsp;<em>{numeral(upper).format('0,0')}</em>.
        <br />
        <br />
        For a detailed explanation of how predictions work, please visit our
        &nbsp;
        <a href="/about/methodology/predictions">methodology page</a>
        .
      </Notification>

      <Generic tooltipPosition="top" className="vt-graph" tooltip="Clicking on legend items will remove them from graph">
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

export default PredictionGraph
