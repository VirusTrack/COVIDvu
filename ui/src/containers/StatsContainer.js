import React, { useEffect, useState } from 'react'

import { useInterval } from '../hooks/ui'

import { useHistory } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { actions } from '../ducks/services'

import { Tab, Button, Level } from 'rbx'

import store from 'store2'

import { REGION_URLS, CACHE_INVALIDATE_GLOBAL_KEY, CACHE_INVALIDATE_US_STATES_KEY, ONE_MINUTE } from '../constants'

import HeroElement from '../components/HeroElement'
import BoxWithLoadingIndicator from '../components/BoxWithLoadingIndicator'
import GlobalStatsTable from '../components/GlobalStatsTable'
import USStatsTable from '../components/USStatsTable'
import USCountiesStatsTable from '../components/USCountiesStatsTable'

export const StatsContainer = ({filter='Global', daysAgoParam = 0}) => {

    const dispatch = useDispatch()
    const history = useHistory()

    const [selectedTab, setSelectedTab] = useState(filter)

    const [filterRegion, setFilterRegion] = useState('')

    const [daysAgo, setDaysAgo] = useState(daysAgoParam)

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
        if(REGION_URLS.hasOwnProperty(key))
            window.open(REGION_URLS[key], "_blank")
    }

    const handleSelectedFilter = (selectedFilter) => {
        setFilterRegion(selectedFilter)
    }

    /**
     * Fetch all the data
     * 
     * we should limit it to what's currently being viewed
     */
    useEffect(() => {
        dispatch(actions.clearStats())

        if(selectedTab === 'Global') {
            dispatch(actions.fetchGlobalStats({daysAgo: daysAgo}))
        } else if(selectedTab === 'US') {
            dispatch(actions.fetchUSStatesStats({daysAgo: daysAgo}))
        } else if(selectedTab === 'US_Counties') {
            dispatch(actions.fetchUSCountiesStats({daysAgo: daysAgo, filterRegion: filterRegion}))
        }
    }, [dispatch, daysAgo, selectedTab, filterRegion])

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

    return (
        <>
        <HeroElement
            title={
                <>Coronavirus <br />COVID-19 Statistics</>
            }
        />

        <BoxWithLoadingIndicator hasData={statsForGraph}>

            <Level align="right">
                <Level.Item >
                <Button size="medium" onClick={() => {if(daysAgo !== 0) { setStatsForGraph([]); setDaysAgo(0) }}} color={daysAgo === 0 ? "primary" : "default"}>Now</Button>
                &nbsp;
                <Button size="medium" onClick={() => {if(daysAgo !== 1) { setStatsForGraph([]); setDaysAgo(1) }}} color={daysAgo === 1 ? "primary " : "default"}>Yesterday</Button></Level.Item>
            </Level>

            <Tab.Group size="large">
                <Tab active={selectedTab === 'Global'} onClick={() => { setStatsForGraph([]); setSelectedTab('Global')}}>Global</Tab>
                <Tab active={selectedTab === 'US'} onClick={() => { setStatsForGraph([]); setSelectedTab('US')}}>United States</Tab>
                <Tab active={selectedTab === 'US_Counties'} onClick={() => { setStatsForGraph([]); setSelectedTab('US_Counties')}}>U.S. Counties</Tab>
            </Tab.Group>


            { selectedTab === 'Global' &&
            
                <GlobalStatsTable 
                    statsForGraph={statsForGraph} 
                    redirectToExternalLink={redirectToExternalLink}    
                    isExternalLinkAvailable={isExternalLinkAvailable}
                    renderDisplay={renderDisplay}
                />
            
            }
            { selectedTab === 'US' &&
            
                <USStatsTable 
                    statsForGraph={statsForGraph} 
                    redirectToExternalLink={redirectToExternalLink}    
                    isExternalLinkAvailable={isExternalLinkAvailable}
                    renderDisplay={renderDisplay}
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
                />
            
            }
        </BoxWithLoadingIndicator>
        </>
    )    
}

export default StatsContainer