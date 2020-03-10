import React, { useEffect, useState } from 'react'

import { Select, Tag, Tab } from "rbx"

import ThreeGraphLayout from '../layouts/ThreeGraphLayout'
import MainLayout from '../layouts/MainLayout'

import Graph from '../components/Graph'
import GraphWithLoader from '../components/GraphWithLoader'

import { US_STATES, DATA_URL } from '../constants'

import axios from 'axios'

import numeral from 'numeral'

export const CovidUSPage = () => {

    const [selectedStates, setSelectedStates] = useState(['!Total US'])

    const [secondaryGraph, setSecondaryGraph] = useState('Deaths')

    const availableStates = US_STATES

    const [confirmedUS, setConfirmedUS] = useState(null)
    const [recoveredUS, setRecoveredUS] = useState(null)
    const [deathsUS, setDeathsUS] = useState(null)
    const [mortalityUS, setMortalityUS] = useState(null)
    const [recoveryUS, setRecoveryUS] = useState(null)

    const [confirmedTotal, setConfirmedTotal] = useState(0)

    const onChangeStates = (event) => {
        const options = event.target.options

        let stateList = []
        for(const option of options) {
            if(option.selected) {
                stateList.push(option.value)
            }
        }
        // history.replace(`/covid?${queryString.stringify({ country: countryList })}`)
        setSelectedStates(stateList)
    }

    useEffect(() => {
        axios.get(`${DATA_URL}/confirmed-US.json`).then(response => {
            const confirmed = response.data
            setConfirmedUS(confirmed)

            const totalUS = Object.values(confirmed['!Total US'])
            setConfirmedTotal(totalUS[totalUS.length - 1])
        })
    }, [])

    useEffect(() => {
        if(deathsUS !== null && confirmedUS !== null && recoveredUS !== null) {
        
            let mortality = {}
            let recovery = {}

            Object.keys(deathsUS).map(country => {
                Object.keys(deathsUS[country]).map(date => {
                    let deathAtDate = deathsUS[country][date]
                    let confirmedAtDate = confirmedUS[country][date]
                    let recoveredAtDate = recoveredUS[country][date]

                    if(!mortality.hasOwnProperty(country)) {
                        mortality[country] = {}
                    }
                    if(!recovery.hasOwnProperty(country)) {
                        recovery[country] = {}
                    }
                    mortality[country][date] = deathAtDate / confirmedAtDate
                    recovery[country][date] = recoveredAtDate / confirmedAtDate
                })
            })

            setMortalityUS(mortality)
            setRecoveryUS(recovery)
        }

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
        <MainLayout>

            <ThreeGraphLayout>
                <>                        
                    <Tag size="large" color="danger">Total Cases: {numeral(confirmedTotal).format('0,0')}</Tag><br />

                    <Select.Container style={{marginTop: '0.5rem'}}>
                        <Select multiple size={10} value={selectedStates} onChange={onChangeStates}>
                            {availableStates.map(state => (
                                <Select.Option key={state} value={state}>{state}</Select.Option>
                            ))}
                        </Select>
                    </Select.Container>
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
        </MainLayout>
    )
}

export default CovidUSPage