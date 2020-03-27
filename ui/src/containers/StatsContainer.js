import React, { useEffect, useState } from 'react'

import { useHistory } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { actions } from '../ducks/services'

import { Tab, Button, Level, Notification } from 'rbx'
import LogoElement from '../components/LogoElement'

import { REGION_URLS } from '../constants'

import HeroElement from '../components/HeroElement'
import BoxWithLoadingIndicator from '../components/BoxWithLoadingIndicator'
import GlobalStatsTable from '../components/GlobalStatsTable'
import USCountiesStatsTable from '../components/USCountiesStatsTable'
import USStatsTable from '../components/USStatsTable'

import ReactGA from 'react-ga';

export const StatsContainer = ({filter='Global', daysAgoParam = 0}) => {

    const dispatch = useDispatch()
    const history = useHistory()

    const [selectedTab, setSelectedTab] = useState(filter)
    const [filterRegion, setFilterRegion] = useState('')
    const [daysAgo, setDaysAgo] = useState(daysAgoParam)
    const [sort, setSort] = useState('confirmed')

    const statsTotals = useSelector(state => state.services.globalStats)
    const usStatsTotals = useSelector(state => state.services.usStatesStats)
    const usCountiesStatsTotals = useSelector(state => state.services.usCountiesStats)
    
    const [statsForGraph, setStatsForGraph] = useState(undefined)

    const renderDisplay = (value) => {
        return value.startsWith('!') ? value.substring(1) : value            
    }

    const isExternalLinkAvailable = (key) => {
        return REGION_URLS.hasOwnProperty(key)
    }

    const redirectToExternalLink = (key) => {
        if(REGION_URLS.hasOwnProperty(key)) {
            window.open(REGION_URLS[key], "_blank")
            ReactGA.event({
                category: 'Stats',
                action: `Redirecting to external link to ${REGION_URLS[key]}`
            })    
        }
    }

    const handleSelectedFilter = (selectedFilter) => {
        setFilterRegion(selectedFilter)
        ReactGA.event({
            category: 'Stats',
            action: `Changing filter on US_Counties to ${selectedFilter}`,
            label: 'Changing Filter'
        })
    }
   
    const handleSort = (column) => {
        setSort(column)
        ReactGA.event({
            category: 'Stats',
            action: `Changed sort to ${sort}`,
            label: 'Sorting'
        })
    }

    /**
     * Fetch all the data
     * 
     * we should limit it to what's currently being viewed
     */
    useEffect(() => {
        dispatch(actions.clearStats())

        if(selectedTab === 'Global') {
            dispatch(actions.fetchGlobalStats({daysAgo: daysAgo, sort}))
        } else if(selectedTab === 'US') {
            dispatch(actions.fetchUSStatesStats({daysAgo: daysAgo, sort}))
        } else if(selectedTab === 'US_Counties') {
            dispatch(actions.fetchUSCountiesStats({daysAgo: daysAgo, filterRegion: filterRegion, sort}))
        }
    }, [dispatch, daysAgo, selectedTab, filterRegion, sort])

    // useInterval(() => {
    //     if(store.session.get(CACHE_INVALIDATE_GLOBAL_KEY)) {
    //         dispatch(actions.fetchGlobalStats({daysAgo: daysAgo}))
    //     }
    //     if(store.session.get(CACHE_INVALIDATE_US_STATES_KEY)) {
    //         dispatch(actions.fetchUSStatesStats({daysAgo: daysAgo}))
    //     }
    // }, ONE_MINUTE)

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
    }, [selectedTab, statsTotals, usStatsTotals, usCountiesStatsTotals, history])

    const changeDayView = (daysAgo) => {
        setStatsForGraph([])
        setDaysAgo(daysAgo)
        ReactGA.event({
            category: 'Stats',
            action: `Changed stats to ${daysAgo === 0 ? 'today' : 'yesterday'}`
        })
    }

    const changeStatsTab = (newSelectedTab) => {
        setStatsForGraph([])
        setSelectedTab(newSelectedTab)
        setSort('confirmed')

        ReactGA.event({
            category: 'Stats',
            action: `Changed stats tab to ${newSelectedTab}`
        })
    }

    return (
        <>
        <HeroElement
            title={
                <>Coronavirus <br />COVID-19 Statistics</>
            }
        />

        <BoxWithLoadingIndicator hasData={statsForGraph}>

            <Notification>
                <Level breakpoint="mobile">
                    <Level.Item align="left">
                        <LogoElement size="small" />
                    </Level.Item>
                    { selectedTab !== 'US_Counties' &&
                        <Level.Item align="right">
                            <Button.Group >
                                <Button size="medium" onClick={() => {if(daysAgo !== 0) { changeDayView(0) }}} color={daysAgo === 0 ? "primary" : "default"}>Today</Button>
                                <Button size="medium" onClick={() => {if(daysAgo !== 1) { changeDayView(1) }}} color={daysAgo === 1 ? "primary " : "default"}>Yesterday</Button>
                            </Button.Group>
                        </Level.Item>
                    }
                </Level>
            </Notification>

            <Tab.Group size="large">
                <Tab active={selectedTab === 'Global'} onClick={() => { changeStatsTab('Global') }}>Global</Tab>
                <Tab active={selectedTab === 'US'} onClick={() => { changeStatsTab('US') }}>United States</Tab>
                <Tab active={selectedTab === 'US_Counties'} onClick={() => { changeStatsTab('US_Counties') }}>U.S. Counties</Tab>
            </Tab.Group>


            { selectedTab === 'Global' &&
            
                <GlobalStatsTable 
                    statsForGraph={statsForGraph} 
                    redirectToExternalLink={redirectToExternalLink}    
                    isExternalLinkAvailable={isExternalLinkAvailable}
                    renderDisplay={renderDisplay}
                    sort={sort}
                    onSort={handleSort}
                />
            
            }
            { selectedTab === 'US' &&
            
                <USStatsTable 
                    statsForGraph={statsForGraph} 
                    redirectToExternalLink={redirectToExternalLink}    
                    isExternalLinkAvailable={isExternalLinkAvailable}
                    renderDisplay={renderDisplay}
                    sort={sort}
                    onSort={handleSort}
                />

            }
            { selectedTab === 'US_Counties' &&
            
                <USCountiesStatsTable 
                    statsForGraph={statsForGraph} 
                    redirectToExternalLink={redirectToExternalLink}    
                    isExternalLinkAvailable={isExternalLinkAvailable}
                    renderDisplay={renderDisplay}
                    filterRegion={filterRegion}
                    onSelectedFilter={handleSelectedFilter}
                    sort={sort}
                    onSort={handleSort}
                />
            
            }
        </BoxWithLoadingIndicator>
        </>
    )    
}

export default StatsContainer
