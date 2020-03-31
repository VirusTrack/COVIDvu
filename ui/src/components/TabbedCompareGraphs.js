import React from 'react'

import { Tab, Notification } from 'rbx'

import { TERMS } from '../constants/dictionary'

import { ENABLE_PREDICTIONS } from '../constants'

import GraphControls from '../components/GraphControls'
import GraphWithLoader from '../components/GraphWithLoader'
import PredictionGraph from '../components/PredictionGraph'

export const TabbedCompareGraphs = (
    {
        secondaryGraph, 
        confirmed, 
        deaths,
        mortality,
        selected,
        handleSelectedGraph,
        handleGraphScale,
        handleShowPredictions,
        predictions,
        showLog,
        showPredictions,
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
                <Tab tooltipPosition="right" tooltip={TERMS['CFR_DEFINITION']} active={secondaryGraph === 'Mortality'} onClick={() => { handleSelectedGraph('Mortality')}}>Case Fatality Rate</Tab>
            </Tab.Group>

            <GraphControls className="TabbedCompareGraphs__controls"
                scale
                showLog={showLog} 
                handleGraphScale={handleGraphScale} 
                showPredictions={showPredictions}
                handleShowPredictions={handleShowPredictions}                
                secondaryGraph={secondaryGraph} 
                parentRegion={parentRegion} 
                selected={selected}
                downloadCSV
                data={activeData()}
                downloadImage
                />

            { (showPredictions && secondaryGraph === 'Cases') &&
                <>
                    <Notification>
                        For a detailed explanation of how predictions work, please visit our <a href="/about/methodology/predictions">methodology page</a>.
                    </Notification>
                    <PredictionGraph
                        graphName="Cases"
                        selected={selected}
                        showLog={showLog}
                        predictions={predictions}
                        confirmed={confirmed}
                    />
                </>
            }
            { !showPredictions &&
                <GraphWithLoader 
                    graphName="Cases"
                    secondaryGraph={secondaryGraph}
                    graph={confirmed}
                    selected={selected}
                    showLog={showLog}
                    y_title="Total confirmed cases"
                />
            }
            

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
                y_title="Case Fatality Rate Percentage"
            />

        </>        
    )
}

export default TabbedCompareGraphs