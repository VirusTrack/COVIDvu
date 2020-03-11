import React, { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { actions } from '../ducks/services'

import { Tag, Tab } from "rbx"

import ThreeGraphLayout from '../layouts/ThreeGraphLayout'

import GraphWithLoader from '../components/GraphWithLoader'

import { COUNTRIES } from '../constants'

import numeral from 'numeral'

import SelectRegionComponent from '../components/SelectRegionComponent'

export const GlobalGraphContainer = () => {

    const dispatch = useDispatch()
      
    const [selectedCountries, setSelectedCountries] = useState(['!Global', '!Outside Mainland China'])
    const [secondaryGraph, setSecondaryGraph] = useState('Deaths')

    const availableCountries = COUNTRIES

    const confirmed = useSelector(state => state.services.global.confirmed)
    const recovered = useSelector(state => state.services.global.recovered)
    const deaths = useSelector(state => state.services.global.deaths)
    const mortality = useSelector(state => state.services.global.mortality)
    const recovery = useSelector(state => state.services.global.recovery)

    const [confirmedTotal, setConfirmedTotal] = useState(0)
    const [totalCountries, setTotalCountries] = useState(0)

    const COUNTRY_COUNT = Object.keys(COUNTRIES).length - 2

    /**
     * Fetch all the data
     */
    useEffect(() => {
        dispatch(actions.fetchGlobal())

    }, [])

    useEffect(() => {
        if(confirmed) {
            const totalGlobal = Object.values(confirmed['!Global'])
            setConfirmedTotal(totalGlobal[totalGlobal.length - 1])

            let confirmedCountries = 0
            for(const country of Object.keys(confirmed)) {
                const total = Object.values(confirmed[country]).reduce((total, value) => total + value)
                
                if(total > 0 && country !== '!Global' && country !== '!Outside Mainland China') {
                    ++confirmedCountries
                }
            }
            setTotalCountries(confirmedCountries)
        }
    }, [confirmed])

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

                <br />
                <Tag size="large" color="info">Countries: {totalCountries} / { COUNTRY_COUNT }</Tag><br />
                
            </>

            <>
            <GraphWithLoader 
                graphName="Cases"
                secondaryGraph="Cases"
                graph={confirmed}
                selected={selectedCountries}
                y_title="Total confirmed cases"
                config={
                    {
                        displayModeBar: false,
                        showlegend: true,
                    }
                }
            />
            </>
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