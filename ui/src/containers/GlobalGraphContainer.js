import React, { useEffect, useState } from 'react'

import { useDispatch } from 'react-redux'

import { useLocation } from 'react-router'

import { useInterval } from '../hooks/ui'
import { useHandleHistory } from '../hooks/nav'
import { useGraphData } from '../hooks/graphData'

import { actions } from '../ducks/services'

import { Tag, Level } from "rbx"

import { CACHE_INVALIDATE_GLOBAL_KEY, ONE_MINUTE } from '../constants'
import numeral from 'numeral'
import store from 'store2'

import TwoGraphLayout from '../layouts/TwoGraphLayout'
import TabbedCompareGraphs from '../components/TabbedCompareGraphs'

import CheckboxRegionComponent from '../components/CheckboxRegionComponent'
import HeroElement from '../components/HeroElement'
import BoxWithLoadingIndicator from '../components/BoxWithLoadingIndicator'

export const GlobalGraphContainer = ({region = [], graph = 'Cases', showLogParam = false}) => {

    const dispatch = useDispatch()
    const { search } = useLocation()

    const handleHistory = useHandleHistory('/covid')

    const [showLog, setShowLog] = useState(showLogParam)
    const [selectedCountries, setSelectedCountries] = useState(region)
    const [secondaryGraph, setSecondaryGraph] = useState(graph)
    
    const { confirmed, sortedConfirmed, deaths, mortality } = useGraphData("global")

    const [confirmedTotal, setConfirmedTotal] = useState(0)

    /**
     * Fetch all the data
     */
    useEffect(() => {
        dispatch(actions.fetchGlobal({showLog}))
    }, [dispatch, showLog])


    useInterval(() => {
        if(store.session.get(CACHE_INVALIDATE_GLOBAL_KEY)) {
            dispatch(actions.fetchGlobal({showLog}))
        }
    }, ONE_MINUTE)

    // Select the Top 3 confirmed from list if nothing is selected
    useEffect(() => {
        if(sortedConfirmed && region.length === 0) {
            setSelectedCountries(sortedConfirmed.slice(0, 3).map(confirmed => confirmed.region))
        }
    }, [sortedConfirmed])

    useEffect(() => {
        if(!search) {
            handleHistory(selectedCountries, secondaryGraph)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if(confirmed) {

            let theConfirmedTotal = 0

            for(let confirm of sortedConfirmed) {
                if(confirm.region === '!Global') {
                    theConfirmedTotal += confirm.stats
                }
            }
            setConfirmedTotal(theConfirmedTotal)

        }
    }, [confirmed, selectedCountries, sortedConfirmed])

    const handleSelectedRegion = (regionList) => {
        setSelectedCountries(regionList)
        handleHistory(regionList, secondaryGraph, showLog)
    }

    const handleSelectedGraph = (selectedGraph) => {
        setSecondaryGraph(selectedGraph)
        handleHistory(selectedCountries, selectedGraph, showLog)
    }    

    const handleGraphScale = (logScale) => {
        setShowLog(logScale)
        handleHistory(selectedCountries, secondaryGraph, logScale)
    }

    return (
        <>
        <HeroElement
            subtitle="Global"
            title={
                <>Coronavirus Cases <br />by Country</>
            }
            buttons={[
                { title: 'Cases By Country', location: '/covid' },
                { title: 'Cases By Continent', location: '/covid/continental' },
            ]}
        />

        <BoxWithLoadingIndicator hasData={sortedConfirmed}>
            <TwoGraphLayout>

                <>
                    <CheckboxRegionComponent
                        data={sortedConfirmed}
                        selected={selectedCountries}
                        handleSelected={dataList => handleSelectedRegion(dataList)} 
                        defaultSelected={region}
                        showLog={showLog}
                    />

                </>

                <TabbedCompareGraphs
                    secondaryGraph={secondaryGraph}
                    confirmed={confirmed}
                    deaths={deaths}
                    mortality={mortality}
                    selected={selectedCountries}
                    handleSelectedGraph={handleSelectedGraph}
                    handleGraphScale={handleGraphScale}
                    showLog={showLog}
                />

                <>
                    <Level>
                        <Level.Item>
                            {!showLog && 
                            
                                <Tag size="large" color="danger">Total Cases: {numeral(confirmedTotal).format('0,0')}</Tag>

                            }
                        </Level.Item>
                    </Level>

                </>

            </TwoGraphLayout>
        </BoxWithLoadingIndicator>

        </>
    )    
}

export default GlobalGraphContainer