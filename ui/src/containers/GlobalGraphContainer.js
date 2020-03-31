import React, { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { useLocation } from 'react-router'

import { useHandleHistory } from '../hooks/nav'
import { useGraphData } from '../hooks/graphData'

import { actions } from '../ducks/services'

import { Tag, Level } from "rbx"

import numeral from 'numeral'

import TwoGraphLayout from '../layouts/TwoGraphLayout'
import TabbedCompareGraphs from '../components/TabbedCompareGraphs'

import CheckboxRegionComponent from '../components/CheckboxRegionComponent'
import HeroElement from '../components/HeroElement'
import BoxWithLoadingIndicator from '../components/BoxWithLoadingIndicator'

import ReactGA from 'react-ga';

export const GlobalGraphContainer = ({region = [], graph = 'Cases', showLogParam = false, showPredictionsParam = false}) => {

    const dispatch = useDispatch()
    const { search } = useLocation()

    const handleHistory = useHandleHistory('/covid')

    const [showLog, setShowLog] = useState(showLogParam)
    const [showPredictions, setShowPredictions] = useState(showPredictionsParam)
    const [selectedCountries, setSelectedCountries] = useState(region)
    const [secondaryGraph, setSecondaryGraph] = useState(graph)
    
    const {confirmed, sortedConfirmed, deaths, mortality} = useGraphData("global")

    const globalPredictions = useSelector(state => state.services.globalPredictions)

    const [confirmedTotal, setConfirmedTotal] = useState(0)

    /**
     * Fetch all the data
     */
    useEffect(() => {
        dispatch(actions.fetchGlobal({showLog}))
        dispatch(actions.fetchGlobalPredictions())
    }, [dispatch, showLog])

    // Select the Top 3 confirmed from list if nothing is selected
    useEffect(() => {
        if(sortedConfirmed && region.length === 0) {
            const newSelectedCountries = sortedConfirmed.slice(1, 4).map(confirmed => confirmed.region)
            setSelectedCountries(newSelectedCountries)
            handleHistory(newSelectedCountries, secondaryGraph, showLog)
        }
    }, [sortedConfirmed])

    useEffect(() => {
        if(!search) {
            handleHistory(selectedCountries, secondaryGraph, showLog)
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

        let actionDescription = `Changed selected regions to ${regionList.join(', ')}`

        if(regionList.length === 0) {
            actionDescription = 'Deselected All Regions'
        }

        ReactGA.event({
            category: 'Region:Global',
            action: `Changed selected regions to ${regionList.join(', ')}`
        })
    }

    const handleSelectedGraph = (selectedGraph) => {
        setSecondaryGraph(selectedGraph)
        handleHistory(selectedCountries, selectedGraph, showLog)

        ReactGA.event({
            category: 'Region:Global',
            action: `Changed selected graph to ${selectedGraph}`
        })
    }    

    const handleGraphScale = (logScale) => {
        setShowLog(logScale)
        handleHistory(selectedCountries, secondaryGraph, logScale)

        ReactGA.event({
            category: 'Region:Global',
            action: `Changed graph scale to ${logScale ? 'logarithmic' : 'linear'}`
        })
    }

    const handleShowPredictions = () => {
        if(selectedCountries.length > 1) {
            setSelectedCountries(['US'])
        }
        setShowPredictions(!showPredictions)

        handleHistory(selectedCountries, secondaryGraph, showLog, !showPredictions)
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
                        showPredictions={showPredictions}
                        predictions={globalPredictions}
                        secondaryGraph={secondaryGraph}
                        showLog={showLog}
                        parentRegion="Global"
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
                    handleShowPredictions={handleShowPredictions}
                    predictions={globalPredictions}
                    showLog={showLog}
                    showPredictions={showPredictions}
                    parentRegion="Global"
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