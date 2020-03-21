import React, { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { useHistory, useLocation } from 'react-router'

import { useWindowSize, useInterval } from '../hooks/ui'

import queryString from 'query-string'

import { actions } from '../ducks/services'

import { Hero, Container, Box, Tag, Tab, Level, Button, Title } from "rbx"

import TwoGraphLayout from '../layouts/TwoGraphLayout'

import GraphWithLoader from '../components/GraphWithLoader'

import { COUNTRIES, CACHE_INVALIDATE_GLOBAL_KEY, ONE_MINUTE } from '../constants'

import numeral from 'numeral'

import store from 'store2'

import SelectRegionComponent from '../components/SelectRegionComponent'

export const GlobalGraphContainer = ({country = ['!Global', 'China'], graph = 'Cases'}) => {

    const dispatch = useDispatch()
    const history = useHistory()
    const { search } = useLocation()

    const [width, height] = useWindowSize()

    const [selectedCountries, setSelectedCountries] = useState(country)
    const [secondaryGraph, setSecondaryGraph] = useState(graph)
    
    const confirmed = useSelector(state => state.services.global.confirmed)
    const sortedConfirmed = useSelector(state => state.services.global.sortedConfirmed)
    const deaths = useSelector(state => state.services.global.deaths)
    const mortality = useSelector(state => state.services.global.mortality)

    const [confirmedTotal, setConfirmedTotal] = useState(0)
    const [totalCountries, setTotalCountries] = useState(0)

    const COUNTRY_COUNT = Object.keys(COUNTRIES).length - 2

    /**
     * Fetch all the data
     */
    useEffect(() => {
        dispatch(actions.fetchGlobal())
    }, [dispatch])


    useInterval(() => {
        if(store.session.get(CACHE_INVALIDATE_GLOBAL_KEY)) {
            dispatch(actions.fetchGlobal())
        }
    }, ONE_MINUTE)

    useEffect(() => {
        if(!search) {
            handleHistory(selectedCountries, secondaryGraph)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    const renderCaseTags = () => {        
        if(selectedCountries.indexOf('!Global') !== -1) {
            return (
                <Tag size="large" color="danger">Total Cases: {numeral(confirmedTotal).format('0,0')}</Tag>
            )
        } else {
            return (
                <Tag size="large" color="danger">Selected Cases: {numeral(confirmedTotal).format('0,0')}</Tag>
            )
        }
    }

    const handleHistory = (region, graph) => {
        const query = queryString.stringify({
            region,
            graph
        })

        history.replace(`/covid?${query}`)
    }

    useEffect(() => {
        if(confirmed) {

            let theConfirmedTotal = 0

            for(let confirm of sortedConfirmed) {
                if(confirm.region === '!Global') {
                    theConfirmedTotal += confirm.stats
                }
            }
            setConfirmedTotal(theConfirmedTotal)

            let confirmedCountries = 0
            for(const country of Object.keys(confirmed)) {
                const total = Object.values(confirmed[country]).reduce((total, value) => total + value)
                
                if(total > 0 && country !== '!Global' && country !== '!Outside Mainland China') {
                    ++confirmedCountries
                }
            }
            setTotalCountries(confirmedCountries)
        }
    }, [confirmed, selectedCountries, sortedConfirmed])

    const handleSelectedRegion = (regionList) => {
        setSelectedCountries(regionList)
        handleHistory(regionList, secondaryGraph)
    }

    const handleSelectedGraph = (selectedGraph) => {
        setSecondaryGraph(selectedGraph)
        handleHistory(selectedCountries, selectedGraph)
    }

    const HeroElement = (props) => {
        return (
            <Hero size="medium">
                <Hero.Body>
                <Container>
                    <Title subtitle size={2}>Global</Title>
                    <Title size={1}>Coronavirus Cases <br/>by Country</Title>
                    <Button.Group>
                        <Button size="large" color="primary" onClick={() => {dispatch(actions.clearGraphs()); history.push('/covid')}}>Cases By Country</Button>
                        <Button size="large" color="primary" onClick={() => {dispatch(actions.clearGraphs()); history.push('/covid/continental')}}>Cases By Continent</Button>
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
        <HeroElement/>
        <Box>
        <TwoGraphLayout>

            <>
            <SelectRegionComponent
                data={sortedConfirmed}
                selected={selectedCountries}
                handleSelected={dataList => handleSelectedRegion(dataList)} />

            </>

            <>
                <Tab.Group size="large" kind="boxed">
                    <Tab active={secondaryGraph === 'Cases'} onClick={() => { handleSelectedGraph('Cases')}}>Cases</Tab>
                    <Tab active={secondaryGraph === 'Deaths'} onClick={() => { handleSelectedGraph('Deaths')}}>Deaths</Tab>
                    <Tab active={secondaryGraph === 'Mortality'} onClick={() => { handleSelectedGraph('Mortality')}}>Mortality</Tab>
                </Tab.Group>

                <GraphWithLoader 
                    graphName="Cases"
                    secondaryGraph={secondaryGraph}
                    graph={confirmed}
                    width={width}
                    height={height}
                    selected={selectedCountries}
                    y_title="Total confirmed cases"
                />

                <GraphWithLoader 
                    graphName="Deaths"
                    secondaryGraph={secondaryGraph}
                    graph={deaths}
                    width={width}
                    height={height}
                    selected={selectedCountries}
                    y_title="Number of deaths"
                />        

                <GraphWithLoader 
                    graphName="Mortality"
                    secondaryGraph={secondaryGraph}
                    graph={mortality}
                    width={width}
                    height={height}
                    selected={selectedCountries}
                    y_type="percent"
                    y_title="Mortality Rate Percentage"
                />
        
            </>

            <>
                <Level>
                    <Level.Item>
                        {renderCaseTags()}
                    </Level.Item>
                </Level>

                <Level>
                    <Level.Item>
                        <Tag size="large" color="info">Countries: {totalCountries} / { COUNTRY_COUNT }</Tag><br /><br />
                    </Level.Item>
                </Level>
            </>

        </TwoGraphLayout>
        </Box>
        </>
    )    
}

export default GlobalGraphContainer