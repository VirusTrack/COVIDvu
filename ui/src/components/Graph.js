import React, { useEffect, useState } from 'react'

import Plot from 'react-plotly.js'

import { useMobileDetect } from '../hooks/ui'

import { Generic } from 'rbx'

export const Graph = ({title, data, y_type='numeric', y_title, x_title, selected, config, width, height}) => {

    const [plotsAsValues, setPlotsAsValues] = useState([])

    const detectMobile = useMobileDetect()

    useEffect(() => {
        let plots = {}

        const selectedData = Object.keys(data).filter(entry => selected.indexOf(entry) !== -1)

        for(const region of selectedData) {
            plots[region] = {
                x: [],
                y: [],
                type: 'scatter',
                mode: 'lines+markers',
                name: region,
                marker: {
                    size: 3
                }
            }            
        }

        for(const region of selectedData) {            
            const regionData = data[region]
            
            for(const key of Object.keys(regionData)) {
                plots[region].x.push(key)
                plots[region].y.push(regionData[key])
            }
        }
    
        setPlotsAsValues(Object.values(plots))
    }, [selected, data, y_type])

    let mergeConfig = { ...config,
        displayModeBar: false,
        showlegend: true,
    }

    let layout = {
        title: title,
        // width: width,
        // height: height,
        margin: {
            l: 50,
            t: 0,
        },        
    }

    if(detectMobile.isMobile()) {
        layout = {
            ...layout,
            xaxis: {
                fixedrange: true
            },
            yaxis: {
                fixedrange: true
            },
            width: width
        }
    }

    if(y_title) {
        layout = {
            ...layout,
            yaxis: {...layout.yaxis, title: y_title}
        }
    }

    if(y_title === 'Mortality Rate Percentage') {
        layout['yaxis'] = { ...layout['yaxis'], tickformat: '.1%'}
    }

    if(x_title) {
        layout['xaxis'].title = x_title
    }

    layout['legend'] = {
        xanchor: 'center',
        yanchor: 'top',
        y:-0.1,
        x:0.5
    }

    return (
        <Generic tooltipPosition="right" tooltip="Clicking on legend items will remove them from graph">
            <Plot
                data={plotsAsValues}
                layout={layout}
                config={mergeConfig}
            />
        </Generic>
    )
}

export default Graph