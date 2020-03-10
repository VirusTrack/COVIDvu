import React, { useEffect, useMemo, useState } from 'react'

import { Column, Tag, Message, Tab } from "rbx"

import ThreeGraphLayout from '../layouts/ThreeGraphLayout'
import DataService from '../services'

import { US_REGIONS } from '../constants'

import GraphWithLoader from '../components/GraphWithLoader'
import SelectRegionComponent from '../components/SelectRegionComponent'

export const USRegionsGraphContainer = () => {
    const dataService = new DataService()

    const [selectedRegions, setSelectedRegions] = useState(['!Total US'])

    const [secondaryGraph, setSecondaryGraph] = useState('Deaths')

    const availableRegions = US_REGIONS

    const [confirmedUSRegions, setConfirmedUSRegions] = useState(null)
    const [recoveredUSRegions, setRecoveredUSRegions] = useState(null)
    const [deathsUSRegions, setDeathsUSRegions] = useState(null)
    const [mortalityUSRegions, setMortalityUSRegions] = useState(null)
    const [recoveryUSRegions, setRecoveryUSRegions] = useState(null)

    const [confirmedTotal, setConfirmedTotal] = useState(0)

    async function fetchConfirmed() {
        const confirmed = await dataService.getConfirmed('-US-Regions')
        if(confirmed) {
            const totalUS = Object.values(confirmed['!Total US'])

            setConfirmedUSRegions(confirmed)
            setConfirmedTotal(totalUS[totalUS.length - 1])
        }
    }

    async function fetchDeaths() {
        const deaths = await dataService.getDeaths('-US-Regions')
        setDeathsUSRegions(deaths)
    }
    
    async function fetchRecovered() {
        const deaths = await dataService.getRecovered('-US-Regions')
        setRecoveredUSRegions(deaths)
    }


    useEffect(() => {
        fetchConfirmed()
        fetchDeaths()
        fetchRecovered()
    }, [])

    useMemo(() => {
        const { mortality, recovery } = dataService.calculateMortalityAndRecovery(deathsUSRegions, confirmedUSRegions, recoveredUSRegions)

        setMortalityUSRegions(mortality)
        setRecoveryUSRegions(recovery)

    }, [deathsUSRegions, confirmedUSRegions, recoveredUSRegions])

    return (
        <ThreeGraphLayout>
            <>                        
                    
                <Tag size="large" color="danger">Total Cases: {confirmedTotal}</Tag><br />

                <SelectRegionComponent
                    data={availableRegions}
                    selected={selectedRegions}
                    handleSelected={(dataList) => {
                        setSelectedRegions(dataList)
                    }} />

            </>

            <GraphWithLoader 
                graphName="Confirmed"
                secondaryGraph="Confirmed"
                title="Cases US Regions"
                graph={confirmedUSRegions}
                selected={selectedRegions}
                y_title="Total confirmed cases"
                config={
                    {
                        displayModeBar: false
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
                    graph={deathsUSRegions}
                    selected={selectedRegions}
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
                    graph={recoveredUSRegions}
                    selected={selectedRegions}
                    y_title='Number of recovered'
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
                    graph={mortalityUSRegions}
                    selected={selectedRegions}
                    y_type='percent'
                    y_title='Mortality Rate Percentage'
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
                    graph={recoveryUSRegions}
                    selected={selectedRegions}
                    y_type='percent'
                    y_title='Recovery Rate Percentage'
                    config={
                        {
                            displayModeBar: false,
                            showlegend: true
                        }
                    }
                />
            </>

            <Column.Group centered breakpoint="mobile">
                <Column size="half">
                <Message size="small" style={{margin: '0.5rem'}} color="link">
                            <Message.Body>
                                <p>
                                    Northeast - CT, MA, ME, NH, NJ, NY, PA, RI, VT
                                </p>
                                <p>
                                    Midwest - IA, IL, IN, KS, MI, MN, MO, ND, NE, OH, SD, WI
                                </p>
                                <p>
                                    South - AL, AR, DC, DE, FL, GA, KY, LA, MD, MS, NC, OK, SC, TN, TX, VA, WV
                                </p>
                                <p>
                                    West - AK, AZ, CA, CO, HI, ID, MI, NM, NV, OR, UT, WA, WY
                                </p>
                            </Message.Body>
                        </Message>                    
                </Column>                
            </Column.Group>
        </ThreeGraphLayout>

    )
}

export default USRegionsGraphContainer