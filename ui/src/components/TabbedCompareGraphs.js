import React from 'react'

import { Tab, Level } from 'rbx'

import GraphWithLoader from '../components/GraphWithLoader'
import GraphScaleControl from '../components/GraphScaleControl'
import GraphDownloadButton from '../components/GraphDownloadButton'

import GraphControls from '../components/GraphControls'

export const TabbedCompareGraphs = (
    {
        secondaryGraph, 
        confirmed, 
        deaths,
        mortality,
        selected,
        handleSelectedGraph,
        handleGraphScale,
        showLog,
        parentRegion,
    }) => {
    
    const activeData = () => {
        if(secondaryGraph === 'Cases') {
            let newData = []

            const firstHeader = Object.keys(confirmed)[0]
            let headers = ['Country', ...Object.keys(confirmed[firstHeader])]

            for(const country of Object.keys(confirmed)) {
                if(selected.indexOf(country) !== -1) {
                    let values = showLog ? Object.values(confirmed[country]).map(val => Math.log10(1+val)) : Object.values(confirmed[country])
                    newData.push([country, ...values])
                }
            }

            return {
                headers: headers,
                data: newData
            }
        } else if(secondaryGraph === 'Deaths') {
            let newData = []

            const firstHeader = Object.keys(deaths)[0]
            let headers = ['Country', ...Object.keys(deaths[firstHeader])]

            for(const country of Object.keys(deaths)) {
                if(selected.indexOf(country) !== -1) {
                    let values = showLog ? Object.values(deaths[country]).map(val => Math.log10(1+val)) : Object.values(deaths[country])
                    newData.push([country, ...values])
                }
            }

            return {
                headers: headers,
                data: newData
            }

        } else if(secondaryGraph === 'Mortality') {
            let newData = []

            const firstHeader = Object.keys(mortality)[0]
            let headers = ['Country', ...Object.keys(mortality[firstHeader])]

            for(const country of Object.keys(mortality)) {
                if(selected.indexOf(country) !== -1) {
                    let values = Object.values(mortality[country])
                    newData.push([country, ...values])
                }
            }

            return {
                headers: headers,
                data: newData
            }

        }
    }

    return (
        <>
            <Tab.Group size="large" kind="boxed">
                <Tab active={secondaryGraph === 'Cases'} onClick={() => { handleSelectedGraph('Cases')}}>Cases</Tab>
                <Tab active={secondaryGraph === 'Deaths'} onClick={() => { handleSelectedGraph('Deaths')}}>Deaths</Tab>
                <Tab active={secondaryGraph === 'Mortality'} onClick={() => { handleSelectedGraph('Mortality')}}>Mortality</Tab>
            </Tab.Group>

            <GraphControls className="TabbedCompareGraphs__controls"
                scale
                showLog={showLog} 
                handleGraphScale={handleGraphScale} 
                secondaryGraph={secondaryGraph} 
                parentRegion={parentRegion} 
                
                downloadCSV
                data={activeData()}

                downloadImage
                />

            <GraphWithLoader 
                graphName="Cases"
                secondaryGraph={secondaryGraph}
                graph={confirmed}
                selected={selected}
                showLog={showLog}
                y_title="Total confirmed cases"
            />
            

            <GraphWithLoader 
                graphName="Deaths"
                secondaryGraph={secondaryGraph}
                graph={deaths}
                selected={selected}
                showLog={showLog}
                y_title="Number of deaths"
            />        

            <GraphWithLoader 
                graphName="Mortality"
                secondaryGraph={secondaryGraph}
                graph={mortality}
                selected={selected}
                y_type="percent"
                y_title="Mortality Rate Percentage"
            />

        </>        
    )
}

export default TabbedCompareGraphs