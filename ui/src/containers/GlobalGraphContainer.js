import React, { useEffect, useState, useMemo } from 'react'

import { Tag, Tab } from "rbx"

import ThreeGraphLayout from '../layouts/ThreeGraphLayout'

import GraphWithLoader from '../components/GraphWithLoader'

import { COUNTRIES } from '../constants'

import numeral from 'numeral'

import DataService from '../services'
import SelectRegionComponent from '../components/SelectRegionComponent'

export const GlobalGraphContainer = () => {

    const dataService = new DataService()

    const [selectedCountries, setSelectedCountries] = useState(['!Global', '!Outside Mainland China'])

    const [secondaryGraph, setSecondaryGraph] = useState('Deaths')

    const availableCountries = COUNTRIES

    const [confirmed, setConfirmed] = useState(null)
    const [recovered, setRecovered] = useState(null)
    const [deaths, setDeaths] = useState(null)
    const [mortality, setMortality] = useState(null)
    const [recovery, setRecovery] = useState(null)

    const [confirmedTotal, setConfirmedTotal] = useState(0)

    async function fetchConfirmed() {
        const confirmed = await dataService.getConfirmed()
        if(confirmed) {
            const totalGlobal = Object.values(confirmed['!Global'])

            setConfirmed(confirmed)
            setConfirmedTotal(totalGlobal[totalGlobal.length - 1])
        }
    }

    async function fetchDeaths() {
        const deaths = await dataService.getDeaths()
        setDeaths(deaths)
    }
    
    async function fetchRecovered() {
        const deaths = await dataService.getRecovered()
        setRecovered(deaths)
    }

    /**
     * Fetch all the data
     */
    useEffect(() => {
        fetchConfirmed()
        fetchDeaths()
        fetchRecovered()
    }, [])

    useMemo(() => {
        const { mortality, recovery } = dataService.calculateMortalityAndRecovery(deaths, confirmed, recovered)

        setMortality(mortality)
        setRecovery(recovery)

    }, [deaths, confirmed, recovered])    

    return (
        <ThreeGraphLayout>

            <>
                <Tag size="large" color="danger">Total Cases: {numeral(confirmedTotal).format('0,0')}</Tag><br />

                <SelectRegionComponent
                    data={availableCountries}
                    selected={selectedCountries}
                    handleSelected={(dataList) => {
                        setSelectedCountries(dataList)
                    }} />
            </>

            <GraphWithLoader 
                    graphName="Cases"
                    secondaryGraph="Cases"
                    graph={confirmed}
                    selected={selectedCountries}
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
                    graph={deaths}
                    selected={selectedCountries}
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
                    graph={recovered}
                    selected={selectedCountries}
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
                    graph={mortality}
                    selected={selectedCountries}
                    y_type="percent"
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
                    graph={recovery}
                    selected={selectedCountries}
                    y_type="percent"
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

export default GlobalGraphContainer