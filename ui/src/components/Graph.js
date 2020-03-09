import React, { useEffect, useState } from 'react'

import Plot from 'react-plotly.js'

export const Graph = ({title, data, selected}) => {

    const [plotsAsValues, setPlotsAsValues] = useState([])

    useEffect(() => {
        let plots = {}

        const selectedData = Object.keys(data).filter(entry => selected.indexOf(entry) !== -1)

        for(const region of selectedData) {
            plots[region] = {
                x: [],
                y: [],
                mode: 'lines',
                name: region
            }            
        }

        for(const region of selectedData) {

            plots[region] = {
                x: [],
                y: [],
                mode: 'lines',
                name: region
            }

            const regionData = data[region]

            for(const key of Object.keys(regionData)) {
                plots[region].x.push(key)
                plots[region].y.push(regionData[key])
            }
        }
    
        setPlotsAsValues(Object.values(plots))
    }, [selected, data])

    return (
        <Plot
            data={plotsAsValues}
            layout={ {width: 400, height: 500, title: title} }
        />

    )
}

export default Graph