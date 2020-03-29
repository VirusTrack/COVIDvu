import React, { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router'

import { useHandleHistory } from '../hooks/nav'
import { useGraphData } from '../hooks/graphData'

import numeral from 'numeral'

import { actions } from '../ducks/services'

import { Tag, Notification, Generic, Title } from "rbx"

import { REGION_URLS } from '../constants'

import TwoGraphLayout from '../layouts/TwoGraphLayout'
import TabbedCompareGraphs from '../components/TabbedCompareGraphs'

import CheckboxRegionComponent from '../components/CheckboxRegionComponent'
import HeroElement from '../components/HeroElement'
import BoxWithLoadingIndicator from '../components/BoxWithLoadingIndicator'

import ReactGA from 'react-ga';

export const USGraphContainer = ({region = [], graph = 'Cases', showLogParam = false, showPredictionsParam = false}) => {

    const dispatch = useDispatch()
    const { search } = useLocation()
    const handleHistory = useHandleHistory('/covid/us')

    const [showLog, setShowLog] = useState(showLogParam)
    const [showPredictions, setShowPredictions] = useState(showPredictionsParam)
    const [selectedStates, setSelectedStates] = useState(region)
    const [secondaryGraph, setSecondaryGraph] = useState(graph)

    const { confirmed, sortedConfirmed, deaths, mortality } = useGraphData("usStates")

    const usPredictions = useSelector(state => state.services.usPredictions)

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

    // Select the Top 3 confirmed from list if nothing is selected
    useEffect(() => {
        if(sortedConfirmed && region.length === 0) {
            setSelectedStates(sortedConfirmed.slice(0, 3).map(confirmed => confirmed.region))
        }
    }, [sortedConfirmed])

    useEffect(() => {
        dispatch(actions.fetchUSStates())
        dispatch(actions.fetchUSPredictions())
    }, [dispatch])

    useEffect(() => {
        if(!search) {
            handleHistory(selectedStates, secondaryGraph)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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
        handleHistory(regionList, graph, showLog)

        ReactGA.event({
            category: 'Region:United States',
            action: `Changed selected regions to ${regionList.join(', ')}`
        })

    }

    const handleSelectedGraph = (selectedGraph) => {
        setSecondaryGraph(selectedGraph)
        handleHistory(selectedStates, graph, showLog)

        ReactGA.event({
            category: 'Region:United States',
            action: `Changed selected graph to ${selectedGraph}`
        })
    }

    const handleGraphScale = (logScale) => {
        setShowLog(logScale)
        handleHistory(selectedStates, secondaryGraph, logScale)

        ReactGA.event({
            category: 'Region:United States',
            action: `Changed graph scale to ${logScale ? 'logarithmic' : 'linear'}`
        })
    }

    const handleShowPredictions = () => {
        if(selectedStates.length > 1) {
            setSelectedStates(['New York'])
        }
        setShowPredictions(!showPredictions)
    }

    return (
        <>

        <HeroElement
            subtitle="United States"
            title={
                <>Coronavirus Cases <br />by State</>
            }
            buttons={[
                { title: 'Cases By State', location: '/covid/us' },
                { title: 'Cases By Region', location: '/covid/us/regions' },
            ]}
        />   

        <BoxWithLoadingIndicator hasData={sortedConfirmed}>
            <TwoGraphLayout>
                <>
                    <CheckboxRegionComponent
                        data={sortedConfirmed}
                        selected={selectedStates}
                        handleSelected={dataList => handleSelectedRegion(dataList)} 
                        defaultSelected={region}
                        showPredictions={showPredictions}
                        predictions={usPredictions}
                        showLog={showLog}
                        parentRegion="US"
                    />
                </>

                <TabbedCompareGraphs
                    secondaryGraph={secondaryGraph}
                    confirmed={confirmed}
                    deaths={deaths}
                    mortality={mortality}
                    selected={selectedStates}
                    handleSelectedGraph={handleSelectedGraph}
                    handleGraphScale={handleGraphScale}
                    handleShowPredictions={handleShowPredictions}
                    predictions={usPredictions}
                    showLog={showLog}
                    showPredictions={showPredictions}
                    parentRegion="US"
                />

                <>
                { !showLog &&
                    <>
                    <Tag size="large" color="danger">Total Cases: {numeral(confirmedTotal).format('0,0')}</Tag><br />
                    </>
                }
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
        </BoxWithLoadingIndicator>
        </>
    )
}

export default USGraphContainer