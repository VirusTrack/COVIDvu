import React, { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation } from 'react-router'

import { useWindowSize, useInterval } from '../hooks/ui'

import queryString from 'query-string'

import { actions } from '../ducks/services'

import { Tag, Tab, Notification, Generic, Title, Level } from "rbx"

import { REGION_URLS, CACHE_INVALIDATE_US_STATES_KEY, ONE_MINUTE } from '../constants'

import TwoGraphLayout from '../layouts/TwoGraphLayout'

import GraphWithLoader from '../components/GraphWithLoader'

import SelectRegionComponent from '../components/SelectRegionComponent'

import numeral from 'numeral'

import store from 'store'

export const USGraphContainer = ({region = ['!Total US'], graph = 'Confirmed'}) => {

    const dispatch = useDispatch()
    const history = useHistory()
    const { search } = useLocation()

    const [width, height] = useWindowSize()

    const [selectedStates, setSelectedStates] = useState(region)

    const [secondaryGraph, setSecondaryGraph] = useState(graph)

    const confirmed = useSelector(state => state.services.usStates.confirmed)
    const sortedConfirmed = useSelector(state => state.services.usStates.sortedConfirmed)
    const deaths = useSelector(state => state.services.usStates.deaths)
    const mortality = useSelector(state => state.services.usStates.mortality)

    const [confirmedTotal, setConfirmedTotal] = useState(0)
    const [unassignedCases, setUnassignedCases] = useState(0)

    const renderDisplay = (value) => {
        return value.startsWith('!') ? value.substring(1) : value            
    }

    const isExternalLinkAvailable = (key) => {
        return REGION_URLS.hasOwnProperty(key)
    }

    const redirectToExternalLink = (key) => {
        if(REGION_URLS.hasOwnProperty(key))
            window.open(REGION_URLS[key], "_blank")
    }

    useEffect(() => {
        dispatch(actions.fetchUSStates())
    }, [dispatch])

    useInterval(() => {
        if(store.get(CACHE_INVALIDATE_US_STATES_KEY)) {
            dispatch(actions.fetchUSStates())
        }
    }, ONE_MINUTE)

    useEffect(() => {
        if(!search) {
            handleHistory(selectedStates, secondaryGraph)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            const unassignedStates = Object.values(confirmed['Unassigned'])

            setConfirmedTotal(totalStates[totalStates.length - 1])
            setUnassignedCases(unassignedStates[unassignedStates.length - 1])
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
        <TwoGraphLayout>
            <>
                <Level>
                    <Level.Item>
                        <SelectRegionComponent
                            data={sortedConfirmed}
                            selected={selectedStates}
                            handleSelected={dataList => handleSelectedRegion(dataList)} />
                    </Level.Item>
                </Level>

            </>


            <>
                <Tab.Group>
                    <Tab active={secondaryGraph === 'Confirmed'} onClick={() => { handleSelectedGraph('Confirmed')}}>Confirmed</Tab>
                    <Tab active={secondaryGraph === 'Deaths'} onClick={() => { handleSelectedGraph('Deaths')}}>Deaths</Tab>
                    <Tab active={secondaryGraph === 'Mortality'} onClick={() => { handleSelectedGraph('Mortality')}}>Mortality</Tab>
                </Tab.Group>

                <GraphWithLoader 
                    graphName="Confirmed"
                    secondaryGraph={secondaryGraph}
                    graph={confirmed}
                    width={width}
                    height={height}
                    selected={selectedStates}
                    y_title="Total confirmed cases"
                />

                <GraphWithLoader 
                    graphName="Deaths"
                    secondaryGraph={secondaryGraph}
                    graph={deaths}
                    width={width}
                    height={height}
                    selected={selectedStates}
                    y_title="Number of deaths"
                />
            
                <GraphWithLoader 
                    graphName="Mortality"
                    secondaryGraph={secondaryGraph}
                    graph={mortality}
                    width={width}
                    height={height}
                    selected={selectedStates}
                    y_type='percent'
                    y_title="Mortality Rate Percentage"
                />
            
            </>

            <>

                <Level>
                    <Level.Item>
                        <Tag size="large" color="danger">Total Cases: {numeral(confirmedTotal).format('0,0')}</Tag><br />
                    </Level.Item>
                </Level>


                <Level>
                    <Level.Item>
                        <Notification color="info">
                            <Title size={6}>Government Services</Title>
                            {selectedStates.map((region, idx) => (
                                <React.Fragment key={idx}>
                                    <Generic as="a" tooltipPosition="left" onClick={()=>{ redirectToExternalLink(region) }} tooltip={isExternalLinkAvailable(region) ? null : "No external link for region yet"} textColor="white">{renderDisplay(region)}</Generic><br />
                                </React.Fragment>
                            ))}
                        </Notification>
                    </Level.Item>
                </Level>

            </>

            <>
                <Level>
                    <Level.Item>
                        <Notification color="warning">
                            The sum of all states and territories may differ from the total because of delays in CDC and individual states reports consolidation. Unassigned cases today = {unassignedCases}
                        </Notification>
                    </Level.Item>
                </Level>
            </>
        </TwoGraphLayout>

    )
}

export default USGraphContainer