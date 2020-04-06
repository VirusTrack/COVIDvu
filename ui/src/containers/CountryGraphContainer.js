import React, { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router'
import { useHandleHistory } from '../hooks/nav'
import { useGraphData } from '../hooks/graphData'
// import { useChangePageTitle } from '../hooks/ui'

import { actions } from '../ducks/services'

import TabbedCompareGraphs from '../components/TabbedCompareGraphs'

import HeroElement from '../components/HeroElement'
import BoxWithLoadingIndicator from '../components/BoxWithLoadingIndicator'

import ReactGA from 'react-ga';

export const CountryGraphContainer = ({region = "US", graph = 'Cases', showLogParam = false, showPredictionsParam = false}) => {

    const dispatch = useDispatch()
    const { search } = useLocation()

    const handleHistory = useHandleHistory(`/covid/country/${region}`)
    // const changePageTitle = useChangePageTitle()

    const [showLog, setShowLog] = useState(showLogParam)
    const [showPredictions, setShowPredictions] = useState(showPredictionsParam)
    const [selectedCountries, setSelectedCountries] = useState(region)
    const [secondaryGraph, setSecondaryGraph] = useState(graph)

    const {confirmed, sortedConfirmed, deaths, mortality} = useGraphData("global")

    const globalPredictions = useSelector(state => state.services.globalPredictions)

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
            handleHistory(newSelectedCountries, secondaryGraph, showLog, showPredictions)
        } else if(showPredictions) {
            if((region.length === 1 && !globalPredictions.hasOwnProperty(region)) || region.length > 1) {
                setSelectedCountries(['US'])
                handleHistory(['US'], secondaryGraph, showLog, showPredictions)
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortedConfirmed])

    useEffect(() => {
        if(!search) {
            handleHistory(selectedCountries, secondaryGraph, showLog, showPredictions)
        } 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
 
    const handleSelectedGraph = (selectedGraph) => {
        setSecondaryGraph(selectedGraph)
        handleHistory(selectedCountries, selectedGraph, showLog, showPredictions)

        ReactGA.event({
            category: 'Region:Country',
            action: `Changed selected graph to ${selectedGraph}`
        })
    }    

    const handleGraphScale = (logScale) => {
        setShowLog(logScale)
        handleHistory(selectedCountries, secondaryGraph, logScale, showPredictions)

        ReactGA.event({
            category: 'Region:Country',
            action: `Changed graph scale to ${logScale ? 'logarithmic' : 'linear'}`
        })
    }

    const handleShowPredictions = () => {
        let historicSelectedCountries = selectedCountries

        if(selectedCountries.length > 1) {
            historicSelectedCountries = ['US']
            setSelectedCountries(historicSelectedCountries)
        }
        setShowPredictions(!showPredictions)
        
        handleHistory(historicSelectedCountries, secondaryGraph, showLog, !showPredictions)
    }

    return (
        <>
        <HeroElement
            title={
                <>Coronavirus Cases in {region}</>
            }
        />

        <BoxWithLoadingIndicator hasData={sortedConfirmed}>
            <>

                {/* <>
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

                </> */}

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

            </>
        </BoxWithLoadingIndicator>

        </>
    )    
}

export default CountryGraphContainer