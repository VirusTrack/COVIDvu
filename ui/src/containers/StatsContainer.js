import React, { useEffect, useState } from 'react'

import { useInterval } from '../hooks/ui'

import { useHistory } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { actions } from '../ducks/services'

import { Table, Title, Tab, Generic, Button, Level, Notification } from 'rbx'
import LogoElement from '../components/LogoElement'

import numeral from 'numeral'

import store from 'store2'

import { REGION_URLS, CACHE_INVALIDATE_GLOBAL_KEY, CACHE_INVALIDATE_US_STATES_KEY, ONE_MINUTE } from '../constants'

import HeroElement from '../components/HeroElement'
import BoxWithLoadingIndicator from '../components/BoxWithLoadingIndicator'

export const StatsContainer = ({filter='Global', daysAgoParam = 0}) => {

    const dispatch = useDispatch()
    const history = useHistory()

    const [selectedTab, setSelectedTab] = useState(filter)

    const [daysAgo, setDaysAgo] = useState(daysAgoParam)

    const statsTotals = useSelector(state => state.services.globalStats)
    const usStatsTotals = useSelector(state => state.services.usStatesStats)
    const usCountiesStatsTotals = useSelector(state => state.services.usCountiesStats)
    
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

    /**
     * Fetch all the data
     * 
     * we should limit it to what's currently being viewed
     */
    useEffect(() => {
        dispatch(actions.clearStats())

        dispatch(actions.fetchGlobalStats({daysAgo: daysAgo}))
        dispatch(actions.fetchUSCountiesStats({daysAgo: daysAgo}))
        dispatch(actions.fetchUSStatesStats({daysAgo: daysAgo}))
    }, [dispatch, daysAgo])

    useInterval(() => {
        if(store.session.get(CACHE_INVALIDATE_GLOBAL_KEY)) {
            dispatch(actions.fetchGlobalStats({daysAgo: daysAgo}))
        }
        if(store.session.get(CACHE_INVALIDATE_US_STATES_KEY)) {
            dispatch(actions.fetchUSStatesStats({daysAgo: daysAgo}))
        }
    }, ONE_MINUTE)

    useEffect(() => {
        if(selectedTab === 'Global' && statsTotals) {
            setStatsForGraph(statsTotals)
            history.replace('/stats?filter=Global')
        } else if(selectedTab === 'US' && usStatsTotals) {
            setStatsForGraph(usStatsTotals)
            history.replace('/stats?filter=US')
        } else if(selectedTab === 'US_Counties' && usCountiesStatsTotals) {
            setStatsForGraph(usCountiesStatsTotals)
            history.replace('/stats?filter=US_Counties')
        }
    }, [selectedTab, statsTotals, usStatsTotals, history])


    return (
        <>
        <HeroElement
            title={
                <>Coronavirus <br />COVID-19 Statistics</>
            }
        />

        <BoxWithLoadingIndicator hasData={statsTotals}>

            <Notification>
                <Level breakpoint="mobile">
                    <Level.Item align="left">
                        <LogoElement size="small" />
                    </Level.Item>
                    <Level.Item align="right">
                        <Button.Group >
                            <Button size="medium" onClick={() => {if(daysAgo !== 0) { setStatsForGraph([]); setDaysAgo(0) }}} color={daysAgo === 0 ? "primary" : "default"}>Now</Button>
                            <Button size="medium" onClick={() => {if(daysAgo !== 1) { setStatsForGraph([]); setDaysAgo(1) }}} color={daysAgo === 1 ? "primary " : "default"}>Yesterday</Button>
                        </Button.Group>
                    </Level.Item>
                </Level>
            </Notification>

            <Tab.Group size="large">
                <Tab active={selectedTab === 'Global'} onClick={() => { setStatsForGraph([]); setSelectedTab('Global')}}>Global</Tab>
                <Tab active={selectedTab === 'US'} onClick={() => { setStatsForGraph([]); setSelectedTab('US')}}>United States</Tab>
                <Tab active={selectedTab === 'US_Counties'} onClick={() => { setStatsForGraph([]); setSelectedTab('US_Counties')}}>U.S. Counties</Tab>
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
                        { filter !== 'US_Counties' &&
                        <Table.Heading>
                            New Cases
                        </Table.Heading>
                        }
                        { filter === 'US' &&
                        <Table.Heading>
                            Hospital Beds
                        </Table.Heading>
                        }
                        <Table.Heading>
                            Deaths
                        </Table.Heading>
                        { filter !== 'US_Counties' &&
                        <>
                        <Table.Heading>
                            New Deaths
                        </Table.Heading>
                        <Table.Heading>
                            Mortality Rate
                        </Table.Heading>
                        </>
                        }
                    </Table.Row>
                </Table.Head>
                <Table.Body>
                    { (statsForGraph && statsForGraph.length > 0) ? statsForGraph.map((stat, idx) => (
                    <Table.Row key={idx}>
                        <Table.Cell>                        
                            <Generic as="a" tooltipPosition="right" onClick={()=>{ redirectToExternalLink(stat.region) }} tooltip={isExternalLinkAvailable(stat.region) ? null : "No external link for region yet"} textColor={isExternalLinkAvailable(stat.region) ? "link": "black"}>{renderDisplay(stat.region)}</Generic>
                        </Table.Cell>
                        <Table.Cell>
                            <Title size={5}>{numeral(stat.confirmed).format('0,0')}</Title>
                        </Table.Cell>
                        { filter !== 'US_Counties' &&
                        <Table.Cell>
                            <Title size={5}>{numeral(stat.confirmedDayChange < 0 ? 0 : stat.confirmedDayChange).format('+0,0')}</Title>
                        </Table.Cell>
                        }
                        { filter === 'US' &&
                        <Table.Heading>
                            <Title size={5}>{stat.hospitalBeds > 0 ? numeral(stat.hospitalBeds).format('0,0') : '-'}</Title>
                        </Table.Heading>
                        }
                        <Table.Cell>
                            <Title size={5}>{numeral(stat.deaths).format('0,0')}</Title>
                        </Table.Cell>
                        { filter !== 'US_Counties' &&
                        <>
                        <Table.Cell>
                            <Title size={5}>{numeral(stat.deathsDayChange < 0 ? 0 : stat.deathsDayChange).format('+0,0')}</Title>
                        </Table.Cell>
                        <Table.Cell>
                            <Title size={6}>{numeral(stat.mortality).format('0.0 %')}</Title>
                        </Table.Cell>
                        </>
                        }
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
        </BoxWithLoadingIndicator>
        </>
    )    
}

export default StatsContainer