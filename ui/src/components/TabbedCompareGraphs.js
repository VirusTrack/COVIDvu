import React from 'react'

import { Tab } from 'rbx'

import GraphWithLoader from '../components/GraphWithLoader'
import GraphScaleControl from '../components/GraphScaleControl'

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

            <GraphScaleControl
                showLog={showLog}
                handleGraphScale={handleGraphScale}
                secondaryGraph={secondaryGraph}
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