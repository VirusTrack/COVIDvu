import React, { useEffect, useState } from 'react'

import { useInterval } from '../hooks/ui'

import { useHistory } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { actions } from '../ducks/services'

import { Hero, Container, Box, Table, Title, Tab, Generic } from 'rbx'

import numeral from 'numeral'

import store from 'store2'

import { REGION_URLS, CACHE_INVALIDATE_GLOBAL_KEY, CACHE_INVALIDATE_US_STATES_KEY, ONE_MINUTE } from '../constants'

export const StatsContainer = ({filter='Global'}) => {

    const dispatch = useDispatch()
    const history = useHistory()

    const [selectedTab, setSelectedTab] = useState(filter)

    // const statsTotals = useSelector(state => state.services.global.statsTotals)
    const statsTotals = useSelector(state => state.services.globalStats)
    // const usStatsTotals = useSelector(state => state.services.usStates.statsTotals)
    const usStatsTotals = useSelector(state => state.services.usStatesStats)
    
    const [statsForGraph, setStatsForGraph] = useState([])

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

    const HeroElement = (props) => {
        return (
        <Hero size="medium">
            <Hero.Body>
            <Container>
                <Title size={1}>Coronavirus <br/>COVID-19 Statistics</Title>
            </Container>
            </Hero.Body>
        </Hero>
        )
    }

    /**
     * Fetch all the data
     */
    useEffect(() => {
        // dispatch(actions.fetchGlobal())
        dispatch(actions.fetchGlobalStats())

        // dispatch(actions.fetchUSStates())
        dispatch(actions.fetchUSStatesStats())

    }, [dispatch])

    useInterval(() => {
        if(store.session.get(CACHE_INVALIDATE_GLOBAL_KEY)) {
            // dispatch(actions.fetchGlobal())
            dispatch(actions.fetchGlobalStats())
        }
        if(store.session.get(CACHE_INVALIDATE_US_STATES_KEY)) {
            // dispatch(actions.fetchUSStates())
            dispatch(actions.fetchUSStatesStats())
        }
    }, ONE_MINUTE)

    useEffect(() => {

        if(selectedTab === 'Global' && statsTotals) {
            setStatsForGraph(statsTotals)
            history.replace('/stats?filter=Global')
        } else if(selectedTab === 'US' && usStatsTotals) {
            setStatsForGraph(usStatsTotals)
            history.replace('/stats?filter=US')
        }
    }, [selectedTab, statsTotals, usStatsTotals, history])

    if(!statsTotals) {
        return (
            <>
            <HeroElement/>
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
        <Tab.Group size="large">
            <Tab active={selectedTab === 'Global'} onClick={() => { setSelectedTab('Global')}}>Global</Tab>
            <Tab active={selectedTab === 'US'} onClick={() => { setSelectedTab('US')}}>United States</Tab>
        </Tab.Group>

        <div className="table-container">
        <Table fullwidth hoverable>
            <Table.Head>
                <Table.Row>
                    <Table.Heading>
                        Region
                    </Table.Heading>
                    <Table.Heading>
                        Total Cases
                    </Table.Heading>
                    <Table.Heading>
                        New Cases
                    </Table.Heading>
                    <Table.Heading>
                        Deaths
                    </Table.Heading>
                    <Table.Heading>
                        New Deaths
                    </Table.Heading>
                    <Table.Heading>
                        Recovered
                    </Table.Heading>
                    <Table.Heading>
                        Mortality Rate
                    </Table.Heading>
                    <Table.Heading>
                        Recovery Rate
                    </Table.Heading>
                </Table.Row>
            </Table.Head>
            <Table.Body>
                { statsForGraph ? statsForGraph.map((stat, idx) => (
                <Table.Row key={idx}>
                    <Table.Cell>                        
                        <Generic as="a" tooltipPosition="right" onClick={()=>{ redirectToExternalLink(stat.region) }} tooltip={isExternalLinkAvailable(stat.region) ? null : "No external link for region yet"} textColor={isExternalLinkAvailable(stat.region) ? "link": "black"}>{renderDisplay(stat.region)}</Generic>
                    </Table.Cell>
                    <Table.Cell>
                        <Title size={5}>{numeral(stat.confirmed).format('0,0')}</Title>
                    </Table.Cell>
                    <Table.Cell>
                        <Title size={5}>{numeral(stat.confirmedDayChange < 0 ? 0 : stat.confirmedDayChange).format('+0,0')}</Title>
                    </Table.Cell>
                    <Table.Cell>
                        <Title size={5}>{numeral(stat.deaths).format('0,0')}</Title>
                    </Table.Cell>
                    <Table.Cell>
                        <Title size={5}>{numeral(stat.deathsDayChange < 0 ? 0 : stat.deathsDayChange).format('+0,0')}</Title>
                    </Table.Cell>
                    <Table.Cell>
                        <Title size={5}>{numeral(stat.recovered).format('0,0')}</Title>
                    </Table.Cell>
                    <Table.Cell>
                        <Title size={6}>{numeral(stat.mortality).format('0.0 %')}</Title>
                    </Table.Cell>
                    <Table.Cell>
                        <Title size={6}>{numeral(stat.recovery).format('0.0 %')}</Title>
                    </Table.Cell>
                </Table.Row>
                )) : (
                    <Table.Row>
                        <Table.Cell>
                            Loading...
                        </Table.Cell>
                    </Table.Row>
                )}
            </Table.Body>
        </Table>
        </div>
        </Box>
        </>
    )    
}

export default StatsContainer