import React, { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { useHistory, useLocation } from 'react-router'
import queryString from 'query-string'

import { actions } from '../ducks/services'

import { Tag, Tab } from "rbx"

import ThreeGraphLayout from '../layouts/ThreeGraphLayout'

import GraphWithLoader from '../components/GraphWithLoader'

import { COUNTRIES } from '../constants'

import numeral from 'numeral'

import SelectRegionComponent from '../components/SelectRegionComponent'

export const GlobalGraphContainer = ({country = ['!Global', 'Mainland China'], graph = 'Deaths'}) => {

    const dispatch = useDispatch()
    const history = useHistory()
    const { search } = useLocation()

    const [selectedCountries, setSelectedCountries] = useState(country)
    const [secondaryGraph, setSecondaryGraph] = useState(graph)
    
    const confirmed = useSelector(state => state.services.global.confirmed)
    const sortedConfirmed = useSelector(state => state.services.global.sortedConfirmed)
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

    }, [dispatch])

    useEffect(() => {
        if(!search) {
            handleHistory(selectedCountries, secondaryGraph)
        }
    }, [])

    const handleHistory = (region, graph) => {
        const query = queryString.stringify({
            region,
            graph
        })

        history.replace(`/covid?${query}`)
    }

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

    const handleSelectedRegion = (regionList) => {
        setSelectedCountries(regionList)
        handleHistory(regionList, secondaryGraph)
    }

    const handleSelectedGraph = (selectedGraph) => {
        setSecondaryGraph(selectedGraph)
        handleHistory(selectedCountries, selectedGraph)
    }

    if(!sortedConfirmed) {
        return (
            <h1>Loading...</h1>
        )
    }
    return (
        <ThreeGraphLayout>

            <>
                <Tag size="large" color="danger">Total Cases: {numeral(confirmedTotal).format('0,0')}</Tag><br />

                <SelectRegionComponent
                    data={sortedConfirmed}
                    selected={selectedCountries}
                    handleSelected={dataList => handleSelectedRegion(dataList)} />

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
                    <Tab active={secondaryGraph === 'Deaths'} onClick={() => { handleSelectedGraph('Deaths')}}>Deaths</Tab>
                    <Tab active={secondaryGraph === 'Recovered'} onClick={() => { handleSelectedGraph('Recovered')}}>Recovered</Tab>
                    <Tab active={secondaryGraph === 'Mortality'} onClick={() => { handleSelectedGraph('Mortality')}}>Mortality</Tab>
                    <Tab active={secondaryGraph === 'Recovery'} onClick={() => { handleSelectedGraph('Recovery')}}>Recovery</Tab>
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