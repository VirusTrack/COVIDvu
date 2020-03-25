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
                    <GraphDownloadButton />
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