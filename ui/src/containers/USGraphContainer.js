import React, { useEffect, useState, useMemo } from 'react'

import { Tag, Tab } from "rbx"

import DataService from '../services'

import ThreeGraphLayout from '../layouts/ThreeGraphLayout'

import GraphWithLoader from '../components/GraphWithLoader'

import SelectRegionComponent from '../components/SelectRegionComponent'

import { US_STATES, DATA_URL } from '../constants'

import axios from 'axios'

import numeral from 'numeral'

export const USGraphContainer = () => {
    const dataService = new DataService()

    const [selectedStates, setSelectedStates] = useState(['!Total US'])

    const [secondaryGraph, setSecondaryGraph] = useState('Deaths')

    const availableStates = US_STATES

    const [confirmedUS, setConfirmedUS] = useState(null)
    const [recoveredUS, setRecoveredUS] = useState(null)
    const [deathsUS, setDeathsUS] = useState(null)
    const [mortalityUS, setMortalityUS] = useState(null)
    const [recoveryUS, setRecoveryUS] = useState(null)

    const [confirmedTotal, setConfirmedTotal] = useState(0)

    useEffect(() => {
        axios.get(`${DATA_URL}/confirmed-US.json`).then(response => {
            const confirmed = response.data
            setConfirmedUS(confirmed)

            const totalUS = Object.values(confirmed['!Total US'])
            setConfirmedTotal(totalUS[totalUS.length - 1])
        })
    }, [])

    useMemo(() => {
        const { mortality, recovery } = dataService.calculateMortalityAndRecovery(deathsUS, confirmedUS, recoveredUS)

        setMortalityUS(mortality)
        setRecoveryUS(recovery)

    }, [deathsUS, confirmedUS, recoveredUS])
    
    useEffect(() => {
        axios.get(`${DATA_URL}/deaths-US.json`).then(response => {
            setDeathsUS(response.data)
        })
    }, [])

    useEffect(() => {
        axios.get(`${DATA_URL}/recovered-US.json`).then(response => {
            setRecoveredUS(response.data)
        })
    }, [])

    return (
        <ThreeGraphLayout>
            <>                        
                <Tag size="large" color="danger">Total Cases: {numeral(confirmedTotal).format('0,0')}</Tag><br />

                <SelectRegionComponent
                    data={availableStates}
                    selected={selectedStates}
                    handleSelected={(dataList) => {
                        setSelectedStates(dataList)
                    }} />

            </>

            <GraphWithLoader 
                graphName="Cases by State"
                secondaryGraph="Cases by State"
                graph={confirmedUS}
                selected={selectedStates}
                y_title="Total confirmed cases"
                config={
                    {
                        displayModeBar: false,
                        showlegend: true
                    }
                }
            />

            <>
                <Tab.Group>
                    <Tab active={secondaryGraph === 'Deaths'} onClick={() => { setSecondaryGraph('Deaths')}}>Deaths</Tab>
                    <Tab active={secondaryGraph === 'Recovered'} onClick={() => { setSecondaryGraph('Recovered')}}>Recovered</Tab>
                    <Tab active={secondaryGraph === 'Mortality'} onClick={() => { setSecondaryGraph('Mortality')}}>Mortality</Tab>
                    <Tab active={secondaryGraph === 'Recovery'} onClick={() => { setSecondaryGraph('Recovery')}}>Recovery</Tab>
                </Tab.Group>

                <GraphWithLoader 
                    graphName="Deaths"
                    secondaryGraph={secondaryGraph}
                    graph={deathsUS}
                    selected={selectedStates}
                    y_title="Number of deaths"
                    config={
                        {
                            displayModeBar: false,
                            showlegend: true
                        }
                    }
                />

                <GraphWithLoader 
                    graphName="Recovered"
                    secondaryGraph={secondaryGraph}
                    graph={recoveredUS}
                    selected={selectedStates}
                    y_title="Number of recovered"
                    config={
                        {
                            displayModeBar: false,
                            showlegend: true
                        }
                    }
                />
            
                <GraphWithLoader 
                    graphName="Mortality"
                    secondaryGraph={secondaryGraph}
                    graph={mortalityUS}
                    selected={selectedStates}
                    y_type='percent'
                    y_title="Mortality Rate Percentage"
                    config={
                        {
                            displayModeBar: false,
                            showlegend: true
                        }
                    }
                />
            
                <GraphWithLoader 
                    graphName="Recovery"
                    secondaryGraph={secondaryGraph}
                    graph={recoveryUS}
                    selected={selectedStates}
                    y_type='percent'
                    y_title="Recovery Rate Percentage"
                    config={
                        {
                            displayModeBar: false,
                            showlegend: true
                        }
                    }
                />              
            </>
        </ThreeGraphLayout>

    )
}

export default USGraphContainer