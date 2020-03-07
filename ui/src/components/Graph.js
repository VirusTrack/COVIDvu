import React, { useEffect, useState } from 'react'

import Plot from 'react-plotly.js'

export const Graph = ({title, data, selectedCountries}) => {

    const [plotsAsValues, setPlotsAsValues] = useState([])

    useEffect(() => {
        let plots = {}

        const selectedData = data.filter(entry => selectedCountries.indexOf(entry['Country/Region']) !== -1)

        for(const elem of selectedData) {

            const country = elem['Country/Region']

            if(!plots.hasOwnProperty(country)) {
                plots[country] = {
                    x: [],
                    y: [],
                    mode: 'lines',
                    name: country
                }
            }

            for(const key of Object.keys(elem)) {

                if(key === 'Country/Region' || key === 'Lat' || key === 'Long') {
                    continue
                }

                plots[country].x.push(key)
                plots[country].y.push(elem[key])
            }
        }
    
        setPlotsAsValues(Object.values(plots))
    }, [selectedCountries])

    return (
        <Plot
            data={plotsAsValues}
            layout={ {width: 450, height: 500, title: title} }
        />

    )
}

export default Graph