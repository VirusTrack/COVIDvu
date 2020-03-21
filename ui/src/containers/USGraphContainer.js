import React, { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation } from 'react-router'

import { useWindowSize, useInterval } from '../hooks/ui'

import queryString from 'query-string'

import { actions } from '../ducks/services'

import { Hero, Container, Box, Tag, Tab, Notification, Generic, Title, Button } from "rbx"

import { REGION_URLS, CACHE_INVALIDATE_US_STATES_KEY, ONE_MINUTE } from '../constants'

import TwoGraphLayout from '../layouts/TwoGraphLayout'

import GraphWithLoader from '../components/GraphWithLoader'

import SelectRegionComponent from '../components/SelectRegionComponent'

import numeral from 'numeral'

import store from 'store2'

export const USGraphContainer = ({region = ['!Total US'], graph = 'Confirmed'}) => {

    const dispatch = useDispatch()
    const history = useHistory()
    const location = useLocation()

    const { search } = location

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

    const changePage = (pageLocation) => {
        if(location.pathname !== pageLocation) {
            dispatch(actions.clearGraphs())
            history.push(pageLocation)
        }
    }

    const redirectToExternalLink = (key) => {
        if(REGION_URLS.hasOwnProperty(key))
            window.open(REGION_URLS[key], "_blank")
    }

    useEffect(() => {
        dispatch(actions.fetchUSStates())
    }, [dispatch])

    useInterval(() => {
        if(store.session.get(CACHE_INVALIDATE_US_STATES_KEY)) {
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

    const HeroElement = (props) => {
        return (
            <Hero size="medium">
            <Hero.Body>
            <Container>
                <Title subtitle size={2}>United States</Title>
                <Title size={1}>Coronavirus Cases <br/>by State</Title>
                <Button.Group>
                        <Button size="large" color="primary" onClick={() => {changePage('/covid/us')}}>Cases By State</Button>
                        <Button size="large" color="primary" onClick={() => {changePage('/covid/us/regions')}}>Cases By Region</Button>
                    </Button.Group>
            </Container>
            </Hero.Body>
        </Hero>
        )
    }

    if(!sortedConfirmed) {
        return (
            <>
            <HeroElement />
            <Box>
                <h1>Loading...</h1>
            </Box>
            </>
        )
    }

    return (
        <>
        <HeroElement />
        <Box>
        <TwoGraphLayout>
            <>
            <SelectRegionComponent
                data={sortedConfirmed}
                selected={selectedStates}
                handleSelected={dataList => handleSelectedRegion(dataList)} />
            </>


            <>
                <Tab.Group size="large" kind="boxed">
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

            <Tag size="large" color="danger">Total Cases: {numeral(confirmedTotal).format('0,0')}</Tag><br />
            </>

            <>
            
            <Title size={3}>Government Services: </Title>
            <ul>
            {selectedStates.map((region, idx) => (
                <React.Fragment key={idx}>
                    <li><Generic as="a" tooltipPosition="left" onClick={()=>{ redirectToExternalLink(region) }} tooltip={isExternalLinkAvailable(region) ? null : "No external link for region yet"}>{renderDisplay(region)}</Generic></li>
                </React.Fragment>
            ))}
            </ul>

            <Notification color="warning" size="small" style={{margin: '1.5rem'}}>
                The sum of all states and territories may differ from the total because of delays in CDC and individual states reports consolidation. Unassigned cases today = {unassignedCases}
            </Notification>
            </>
        </TwoGraphLayout>
        </Box>
        </>
    )
}

export default USGraphContainer