import React, { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation } from 'react-router'

import queryString from 'query-string'
import store from 'store2'

import { useInterval } from '../hooks/ui'

import { actions } from '../ducks/services'

import { Tag, Tab, Notification, Level } from "rbx"

import { CACHE_INVALIDATE_US_REGIONS_KEY, ONE_MINUTE } from '../constants'

import TwoGraphLayout from '../layouts/TwoGraphLayout'

import GraphScaleControl from '../components/GraphScaleControl'
import GraphWithLoader from '../components/GraphWithLoader'
import CheckboxRegionComponent from '../components/CheckboxRegionComponent'
import HeroElement from '../components/HeroElement'
import BoxWithLoadingIndicator from '../components/BoxWithLoadingIndicator'

export const USRegionsGraphContainer = ({region = [], graph = 'Confirmed', showLogParam = false}) => {
    const dispatch = useDispatch()
    const history = useHistory()
    const location = useLocation()
    const { search } = location

    const [showLog, setShowLog] = useState(showLogParam)
    const [selectedRegions, setSelectedRegions] = useState(region)
    const [secondaryGraph, setSecondaryGraph] = useState(graph)

    const confirmed = useSelector(state => state.services.usRegions.confirmed)
    const sortedConfirmed = useSelector(state => state.services.usRegions.sortedConfirmed)
    const deaths = useSelector(state => state.services.usRegions.deaths)
    const mortality = useSelector(state => state.services.usRegions.mortality)

    const [confirmedTotal, setConfirmedTotal] = useState(0)
    const [unassignedCases, setUnassignedCases] = useState(0)

    useEffect(() => {
        dispatch(actions.fetchUSRegions())
    }, [dispatch])

    // Select the Top 3 confirmed from list if nothing is selected
    useEffect(() => {
        if(sortedConfirmed && region.length === 0) {
            setSelectedRegions(sortedConfirmed.slice(0, 3).map(confirmed => confirmed.region))
        }
    }, [sortedConfirmed])

    useInterval(() => {
        if(store.session.get(CACHE_INVALIDATE_US_REGIONS_KEY)) {
            dispatch(actions.fetchUSRegions())
        }
    }, ONE_MINUTE)

    useEffect(() => {
        if(!search) {
            handleHistory(selectedRegions, secondaryGraph)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleHistory = (region, graph, showLog) => {
        const query = queryString.stringify({
            region,
            graph,
            showLog
        })

        history.replace(`/covid/us/regions?${query}`)
    }

    useEffect(() => {
        if(confirmed) {
            const totalRegions = Object.values(confirmed['!Total US'])
            setConfirmedTotal(totalRegions[totalRegions.length - 1])

            if(confirmed.hasOwnProperty('Unassigned')) {
                const unassignedRegions = Object.values(confirmed['Unassigned'])
                setUnassignedCases(unassignedRegions[unassignedRegions.length - 1])
            }
        }
    }, [confirmed])    

    const handleSelectedRegion = (regionList) => {
        setSelectedRegions(regionList)
        handleHistory(regionList, graph)
    }

    const handleSelectedGraph = (selectedGraph) => {
        setSecondaryGraph(selectedGraph)
        handleHistory(selectedRegions, selectedGraph)
    }    

    const handleGraphScale = (logScale) => {
        setShowLog(logScale)
        handleHistory(selectedRegions, secondaryGraph, logScale)
    }

    return (
        <>  
        <HeroElement
            subtitle="United States"
            title={
                <>Coronavirus Cases <br />by Region</>
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
                    selected={selectedRegions}
                    handleSelected={dataList => handleSelectedRegion(dataList)} 
                    defaultSelected={region}
                    showLog={showLog}
                />
            </>
            <>
                <Tab.Group size="large" kind="boxed">
                    <Tab active={secondaryGraph === 'Confirmed'} onClick={() => { handleSelectedGraph('Confirmed')}}>Confirmed</Tab>
                    <Tab active={secondaryGraph === 'Deaths'} onClick={() => { handleSelectedGraph('Deaths')}}>Deaths</Tab>
                    <Tab active={secondaryGraph === 'Mortality'} onClick={() => { handleSelectedGraph('Mortality')}}>Mortality</Tab>
                </Tab.Group>

                <GraphScaleControl
                    showLog={showLog}
                    handleGraphScale={handleGraphScale}
                    secondaryGraph={secondaryGraph}
                />

                <GraphWithLoader 
                    graphName="Confirmed"
                    secondaryGraph={secondaryGraph}
                    title="Cases US Regions"
                    graph={confirmed}
                    selected={selectedRegions}
                    showLog={showLog}
                    y_title="Total confirmed cases"
                />
                
                <GraphWithLoader 
                    graphName="Deaths"
                    secondaryGraph={secondaryGraph}
                    graph={deaths}
                    selected={selectedRegions}
                    showLog={showLog}
                    y_title="Number of deaths"
                />

                <GraphWithLoader 
                    graphName="Mortality"
                    secondaryGraph={secondaryGraph}
                    graph={mortality}
                    selected={selectedRegions}
                    y_type='percent'
                    y_title='Mortality Rate Percentage'
                />
            </>

            <Level>
                <Level.Item>
                    {!showLog &&
                        <>
                            <Tag size="large" color="danger">Total Cases: {confirmedTotal}</Tag>
                            <br />
                        </>
                    }
                </Level.Item>
            </Level>

            <Notification color="warning">
                The sum of all regions may differ from the total because of delays in CDC and individual states reports consolidation. Unassigned cases today = {unassignedCases}
            </Notification>
                             
            <Notification style={{fontSize: '1.4rem'}}>
                    <p>
                        Northeast - CT, MA, ME, NH, NJ, NY, PA, RI, VT
                    </p>
                    <p>
                        Midwest - IA, IL, IN, KS, MI, MN, MO, ND, NE, OH, SD, WI
                    </p>
                    <p>
                        South - AL, AR, DC, DE, FL, GA, KY, LA, MD, MS, NC, OK, SC, TN, TX, VA, WV
                    </p>
                    <p>
                        West - AK, AZ, CA, CO, HI, ID, MI, NM, NV, OR, UT, WA, WY
                    </p>
            </Notification> 

        </TwoGraphLayout>
        </BoxWithLoadingIndicator>
        </>
    )
}

export default USRegionsGraphContainer