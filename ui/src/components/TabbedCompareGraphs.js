import React from 'react'

import { Tab, Level, Notification } from 'rbx'

import GraphWithLoader from '../components/GraphWithLoader'
import GraphScaleControl from '../components/GraphScaleControl'
import GraphDownloadButton from '../components/GraphDownloadButton'

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
    }) => {
    
    const activeData = () => {
        if(secondaryGraph === 'Cases') {
            let newData = []

            const firstHeader = Object.keys(confirmed)[0]
            let headers = ['Country', ...Object.keys(confirmed[firstHeader])]

            for(const country of Object.keys(confirmed)) {
                if(selected.indexOf(country) !== -1) {
                    newData.push([country, ...Object.values(confirmed[country])])
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
                    newData.push([country, ...Object.values(deaths[country])])
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
                    newData.push([country, ...Object.values(mortality[country])])
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

            <Level className="TabbedCompareGraphs__controls">
                <Level.Item align="left">
                    <GraphScaleControl
                        showLog={showLog}
                        handleGraphScale={handleGraphScale}
                        secondaryGraph={secondaryGraph}
                    />
                </Level.Item>
                <Level.Item align="right">
                    <GraphDownloadButton data={activeData()} />
                </Level.Item>
            </Level>

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