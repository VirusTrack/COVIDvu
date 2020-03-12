import React, { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation } from 'react-router'
import queryString from 'query-string'

import { actions } from '../ducks/services'

import { Tag, Tab } from "rbx"

import ThreeGraphLayout from '../layouts/ThreeGraphLayout'

import GraphWithLoader from '../components/GraphWithLoader'

import SelectRegionComponent from '../components/SelectRegionComponent'

import numeral from 'numeral'

export const USGraphContainer = ({region = ['!Total US'], graph = 'Deaths'}) => {

    const dispatch = useDispatch()
    const history = useHistory()
    const { search } = useLocation()

    const [selectedStates, setSelectedStates] = useState(region)

    const [secondaryGraph, setSecondaryGraph] = useState(graph)

    const confirmed = useSelector(state => state.services.usStates.confirmed)
    const sortedConfirmed = useSelector(state => state.services.usStates.sortedConfirmed)
    const recovered = useSelector(state => state.services.usStates.recovered)
    const deaths = useSelector(state => state.services.usStates.deaths)
    const mortality = useSelector(state => state.services.usStates.mortality)
    const recovery = useSelector(state => state.services.usStates.recovery)

    const [confirmedTotal, setConfirmedTotal] = useState(0)

    useEffect(() => {
        dispatch(actions.fetchUSStates())
    }, [dispatch])

    useEffect(() => {
        if(!search) {
            handleHistory(selectedStates, secondaryGraph)
        }
    }, [])

    const handleHistory = (region, graph) => {        
        const query = queryString.stringify({
            region,
            graph
        })

        history.replace(`/covid/us?${query}`)
    }

    useEffect(() => {
        if(confirmed) {
            const totalStates = Object.values(confirmed['!Total US'])
            setConfirmedTotal(totalStates[totalStates.length - 1])
        }
    }, [confirmed])
    
    const handleSelectedRegion = (regionList) => {
        setSelectedStates(regionList)
        handleHistory(regionList, graph)
    }

    const handleSelectedGraph = (selectedGraph) => {
        setSecondaryGraph(selectedGraph)
        handleHistory(selectedStates, graph)
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
                    selected={selectedStates}
                    handleSelected={dataList => handleSelectedRegion(dataList)} />

            </>

            <GraphWithLoader 
                graphName="Cases by State"
                secondaryGraph="Cases by State"
                graph={confirmed}
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
                    <Tab active={secondaryGraph === 'Deaths'} onClick={() => { handleSelectedGraph('Deaths')}}>Deaths</Tab>
                    <Tab active={secondaryGraph === 'Recovered'} onClick={() => { handleSelectedGraph('Recovered')}}>Recovered</Tab>
                    <Tab active={secondaryGraph === 'Mortality'} onClick={() => { handleSelectedGraph('Mortality')}}>Mortality</Tab>
                    <Tab active={secondaryGraph === 'Recovery'} onClick={() => { handleSelectedGraph('Recovery')}}>Recovery</Tab>
                </Tab.Group>

                <GraphWithLoader 
                    graphName="Deaths"
                    secondaryGraph={secondaryGraph}
                    graph={deaths}
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
                    graph={recovered}
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
                    graph={mortality}
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
                    graph={recovery}
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