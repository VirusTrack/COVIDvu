import React, { useEffect, useState } from 'react'

import Plot from 'react-plotly.js'

import { useMobileDetect } from '../hooks/ui'

import { Generic } from 'rbx'

import LogoElement from './LogoElement'

export const PredictionGraph = ({title, predictions, confirmed, selected, showLog = false}) => {

    const [plotsAsValues, setPlotsAsValues] = useState([])

    const detectMobile = useMobileDetect()

    var colors = ['green', 'red', 'blue']

    useEffect(() => {

        if(Object.keys(predictions).length > 0 && Object.keys(confirmed).length > 0) {

            let plots = {}
            let plots_2_5 = {}
            let plots_25 = {}
            let plots_97_5 = {}
            let plots_75 = {}
            let plots_mean = {}

            const selectedData = Object.keys(confirmed).filter(entry => selected.indexOf(entry) !== -1)

            let plotList = []
            for(const region of selectedData) {
                const normalizedRegion = region.startsWith('!') ? region.substring(1) : region
                plots[normalizedRegion] = {
                    x: [],
                    y: [],
                    type: 'scatter',
                    mode: 'lines+markers',
                    name: normalizedRegion,
                    showlegend: true,
                    marker: {
                        color: colors[0],
                        size: 5
                    }
                }
                plots_2_5[normalizedRegion] = {
                    x: [],
                    y: [],
                    line: {
                        color: colors[0],
                    },
                    type: 'scatter',
                    mode: 'lines',
                    name: "2.5%",
                    showlegend: false,
                    hoverinfo: 'skip',
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
                    name: "97.5%",
                    showlegend: false,
                    hoverinfo: 'skip',
                }
                plots_25[normalizedRegion] = {
                    x: [],
                    y: [],
                    line: {
                        color: colors[0],
                    },
                    type: 'scatter',
                    mode: 'lines',
                    name: "25%",
                    fill: null,
                    showlegend: false,
                    hoverinfo: 'skip',
                }
                plots_75[normalizedRegion] = {
                    x: [],
                    y: [],
                    line: {
                        color: '#17BECF',
                    },
                    type: 'scatter',
                    mode: 'lines',
                    fill: 'tonexty',
                    name: "75%",
                    showlegend: false,
                    hoverinfo: 'skip',

                }
                plots_mean[normalizedRegion] = {
                    x: [],
                    y: [],
                    type: 'scatter',
                    mode: 'lines',
                    name: "Mean prediction",
                    line: {
                        color: colors[0],
                        dash: 'dash'
                    },
                    marker: {
                        size: 5
                    },
                    showlegend: false
                }

                const regionData = confirmed[region]
                for(const key of Object.keys(regionData).sort()) {
                    plots[normalizedRegion].x.push(key)
                    plots[normalizedRegion].y.push(regionData[key])
                }

                for(const key of Object.keys(predictions[region].confidenceInterval['2.5'])) {
                    plots_2_5[normalizedRegion].x.push(key)
                    plots_2_5[normalizedRegion].y.push(predictions[region].confidenceInterval['2.5'][key])
                }
                for(const key of Object.keys(predictions[region].confidenceInterval['97.5'])) {
                    plots_97_5[normalizedRegion].x.push(key)
                    plots_97_5[normalizedRegion].y.push(predictions[region].confidenceInterval['97.5'][key])
                }
                for(const key of Object.keys(predictions[region].confidenceInterval['25'])) {
                    plots_25[normalizedRegion].x.push(key)
                    plots_25[normalizedRegion].y.push(predictions[region].confidenceInterval['25'][key])
                }
                for(const key of Object.keys(predictions[region].confidenceInterval['75'])) {
                    plots_75[normalizedRegion].x.push(key)
                    plots_75[normalizedRegion].y.push(predictions[region].confidenceInterval['75'][key])
                }
                for(const key of Object.keys(predictions[region].mean)) {
                    plots_mean[normalizedRegion].x.push(key)
                    plots_mean[normalizedRegion].y.push(predictions[region].mean[key])
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
    }, [selected, predictions])

    let mergeConfig = { 
        displayModeBar: false,
        responsive: true,
    }

    let layout = {
        title: title,
        autosize: true,
        width: undefined,
        height: undefined,
        margin: {
            l: 70,
            t: 5,
            r: 10,
        },  
        annotations: [
            {
              x: '2020-03-30',
              y: 5,
              xref: 'x',
              yref: 'y',
              text: 'We Are Here',
              showarrow: true,
              arrowhead: 7,
              ax: 0,
              ay: -40
            }
          ],
    }
    
    if(showLog) {
        layout['yaxis'] = {
            type: 'log',
            autorange: true
        }
    }

    if(detectMobile.isMobile()) {
        layout = {
            ...layout,
            xaxis: {
                fixedrange: true
            }
        }

        if(!showLog) {
            layout = {
                ...layout,
                yaxis: {
                    fixedrange: true
                }
            }
        }
    }

    layout['legend'] = {
        xanchor: 'center',
        yanchor: 'top',
        y:-0.1,
        x:0.5,
    }

    return (
        <Generic tooltipPosition="top" className="vt-graph" tooltip="Clicking on legend items will remove them from graph">
            <div className="vt-graph-logo"><LogoElement url /></div>
            <Plot
                data={plotsAsValues}
                layout={layout}
                config={mergeConfig}
                useResizeHandler={true}
                style={{width: '100%', height: '100%', minHeight: '45rem'}}
            />
        </Generic>
    )
}

export default PredictionGraph