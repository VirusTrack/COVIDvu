import React, { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation } from 'react-router'
import queryString from 'query-string'

import { useWindowSize, useInterval } from '../hooks/ui'

import { actions } from '../ducks/services'

import { Column, Tag, Message, Tab, Notification, Level } from "rbx"

import { CACHE_INVALIDATE_US_REGIONS_KEY, ONE_MINUTE } from '../constants'

import TwoGraphLayout from '../layouts/TwoGraphLayout'

import GraphWithLoader from '../components/GraphWithLoader'
import SelectRegionComponent from '../components/SelectRegionComponent'

import store from 'store'

export const USRegionsGraphContainer = ({region = ['!Total US'], graph = 'Confirmed'}) => {
    const dispatch = useDispatch()
    const history = useHistory()
    const { search } = useLocation()
    const [width, height] = useWindowSize()

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

    useInterval(() => {
        if(store.get(CACHE_INVALIDATE_US_REGIONS_KEY)) {
            dispatch(actions.fetchUSRegions())
        }
    }, ONE_MINUTE)

    useEffect(() => {
        if(!search) {
            handleHistory(selectedRegions, secondaryGraph)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleHistory = (region, graph) => {
        const query = queryString.stringify({
            region,
            graph
        })

        history.replace(`/covid/us/regions?${query}`)
    }

    useEffect(() => {
        if(confirmed) {
            const totalRegions = Object.values(confirmed['!Total US'])
            const unassignedRegions = Object.values(confirmed['Unassigned'])

            setConfirmedTotal(totalRegions[totalRegions.length - 1])
            setUnassignedCases(unassignedRegions[unassignedRegions.length - 1])
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

    if(!sortedConfirmed) {
        return (
            <h1>Loading...</h1>
        )
    }

    return (
        <TwoGraphLayout>
            <>                        

                <Level>
                    <Level.Item>
                        <SelectRegionComponent
                            data={sortedConfirmed}
                            selected={selectedRegions}
                            handleSelected={dataList => handleSelectedRegion(dataList)} />
                    </Level.Item>
                </Level>

            </>

            <>
                <Tab.Group>
                    <Tab active={secondaryGraph === 'Confirmed'} onClick={() => { handleSelectedGraph('Confirmed')}}>Confirmed</Tab>
                    <Tab active={secondaryGraph === 'Deaths'} onClick={() => { handleSelectedGraph('Deaths')}}>Deaths</Tab>
                    <Tab active={secondaryGraph === 'Mortality'} onClick={() => { handleSelectedGraph('Mortality')}}>Mortality</Tab>
                </Tab.Group>

                <GraphWithLoader 
                    graphName="Confirmed"
                    secondaryGraph={secondaryGraph}
                    title="Cases US Regions"
                    graph={confirmed}
                    width={width}
                    height={height}
                    selected={selectedRegions}
                    y_title="Total confirmed cases"
                />
                
                <GraphWithLoader 
                    graphName="Deaths"
                    secondaryGraph={secondaryGraph}
                    graph={deaths}
                    width={width}
                    height={height}
                    selected={selectedRegions}
                    y_title="Number of deaths"
                />

                <GraphWithLoader 
                    graphName="Mortality"
                    secondaryGraph={secondaryGraph}
                    graph={mortality}
                    width={width}
                    height={height}
                    selected={selectedRegions}
                    y_type='percent'
                    y_title='Mortality Rate Percentage'
                />
            </>

            <Level>
                <Level.Item>
                    <Tag size="large" color="danger">Total Cases: {confirmedTotal}</Tag><br />
                </Level.Item>
            </Level>

            <Column.Group centered>
                <Column>
                <Message size="small" style={{margin: '0.5rem'}} color="link">
                            <Message.Body>
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
                            </Message.Body>
                        </Message>                    
                </Column>                
            </Column.Group>

            <>
                <Level>
                    <Level.Item>
                        <Notification color="warning">
                            The sum of all regions may differ from the total because of delays in CDC and individual states reports consolidation. Unassigned cases today = {unassignedCases}
                        </Notification>
                    </Level.Item>
                </Level>
            </>

        </TwoGraphLayout>

    )
}

export default USRegionsGraphContainer