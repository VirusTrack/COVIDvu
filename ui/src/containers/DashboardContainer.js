import React, { useEffect } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { useHistory } from 'react-router'

import { useWindowSize, useInterval } from '../hooks/ui'

import { actions } from '../ducks/services'

import { Tag, Title, Level, Heading, Button } from "rbx"

import GraphWithLoader from '../components/GraphWithLoader'

import { CACHE_INVALIDATE_GLOBAL_KEY, CACHE_INVALIDATE_US_STATES_KEY, CACHE_INVALIDATE_US_REGIONS_KEY, ONE_MINUTE } from '../constants'

import numeral from 'numeral'

import store from 'store'

import moment from 'moment'

export const DashboardContainer = () => {

    const dispatch = useDispatch()
    const history = useHistory()

    useEffect(() => {
        dispatch(actions.fetchTop10Countries())
        dispatch(actions.fetchGlobalStats())

        dispatch(actions.fetchTop10USStates())
        dispatch(actions.fetchUSStatesStats())

        dispatch(actions.fetchUSRegions())

    }, [dispatch])

    useInterval(() => {
        if(store.get(CACHE_INVALIDATE_GLOBAL_KEY)) {
            dispatch(actions.fetchTop10Countries())
            dispatch(actions.fetchGlobalStats())
        }
        if(store.get(CACHE_INVALIDATE_US_STATES_KEY)) {
            dispatch(actions.fetchTop10USStates())
            dispatch(actions.fetchUSStatesStats())
        }
        if(store.get(CACHE_INVALIDATE_US_REGIONS_KEY)) {
            dispatch(actions.fetchUSRegions())
        }
    }, ONE_MINUTE)

    const lastUpdate = useSelector(state => state.services.lastUpdate)

    const [width, height] = useWindowSize()

    useEffect(() => {
        dispatch(actions.fetchLastUpdate())
    }, [dispatch])

    const globalTop10 = useSelector(state => state.services.globalTop10)
    const globalStats = useSelector(state => state.services.globalStats)
    
    const usStatesTop10 = useSelector(state => state.services.usStatesTop10)
    const usStatesStats = useSelector(state => state.services.usStatesStats)
    
    const confirmedUSRegions = useSelector(state => state.services.usRegions.confirmed)

    const renderChangeDifference = (value) => {
        
        const greenColor = {color: 'hsl(141, 53%, 53%)'}
        const redColor = {color: 'hsl(348, 100%, 61%)'}

        const colorBasedOnChange = value >= 0 ? redColor : greenColor

        return (
            <Title as="p" style={colorBasedOnChange}>{numeral(value).format('+0,0')}</Title>
        )
    }

    return (
        <>
        <Level>
            <Level.Item>
                { lastUpdate && 
                    <Tag color="primary">Last updated: {moment(lastUpdate).format('YYYY-MM-DD HH:mm:ss')}</Tag>
                }
            </Level.Item>

        </Level>

        <Level>
            <Level.Item>
                <Title size={2}>Today's Global Totals</Title>
            </Level.Item>
        </Level>


        <Level>
            <Level.Item textAlign="centered">
                <div>
                <Heading>Total Cases</Heading>
                <Title as="p">{numeral(globalStats.confirmed).format('0,0')}</Title>
                </div>
            </Level.Item>
            <Level.Item textAlign="centered">
                <div>
                <Heading>Total Deaths</Heading>
                <Title as="p">{numeral(globalStats.deaths).format('0,0')}</Title>
                </div>
            </Level.Item>
        </Level>        
        
        <Level>
            <Level.Item textAlign="centered">
                <div>
                <Heading>New Cases (as of today)</Heading>
                { renderChangeDifference(globalStats.newConfirmed)}
                </div>
            </Level.Item>
            <Level.Item textAlign="centered">
                <div>
                <Heading>New Deaths (as of today)</Heading>
                { renderChangeDifference(globalStats.newDeaths)}
                </div>
            </Level.Item>
        </Level>
        <Level>
            <Level.Item textAlign="centered">
                <div>
                <Heading>Recovery Rate</Heading>
                <Title as="p">{numeral(globalStats.recovery).format('0.0 %')}</Title>
                </div>
            </Level.Item>
            <Level.Item textAlign="centered">
                <div>
                <Heading>Mortality Rate</Heading>
                <Title as="p">{numeral(globalStats.mortality).format('0.0 %')}</Title>
                </div>
            </Level.Item>
        </Level>

        <hr />

        <Level>
            <Level.Item>
                <Heading>Top 10 Confirmed Cases (by Country)</Heading>
            </Level.Item>
        </Level>

        <Level>
            <Level.Item>
                <GraphWithLoader 
                    graphName="Top 10 Confirmed Cases"
                    secondaryGraph="Top 10 Confirmed Cases"
                    graph={globalTop10}
                    width={width}
                    height={height}
                    selected={Object.keys(globalTop10)}
                />
            </Level.Item>
        </Level>

        <hr />

        <Level>
            <Level.Item>
                <Button color="primary" onClick={() => { dispatch(actions.clearGraphs()); history.push('/covid')}}>Compare Country Stats</Button>
            </Level.Item>
        </Level>

        <hr />


        <Level>
            <Level.Item>
                <Title size={3}>Today's United States Totals</Title>
            </Level.Item>
        </Level>

        <Level>
            <Level.Item textAlign="centered">
                <div>
                <Heading>Total Cases</Heading>
                <Title as="p">{numeral(usStatesStats.confirmed).format('0,0')}</Title>
                </div>
            </Level.Item>
            <Level.Item textAlign="centered">
                <div>
                <Heading>Total Deaths</Heading>
                <Title as="p">{numeral(usStatesStats.deaths).format('0,0')}</Title>
                </div>
            </Level.Item>
        </Level>        
        

        <Level>
            <Level.Item textAlign="centered">
                <div>
                <Heading>New Cases</Heading>
                { renderChangeDifference(usStatesStats.newConfirmed)}
                </div>
            </Level.Item>
            <Level.Item textAlign="centered">
                <div>
                <Heading>New Deaths</Heading>
                { renderChangeDifference(usStatesStats.newDeaths)}
                </div>
            </Level.Item>
        </Level>

        <Level>
            <Level.Item textAlign="centered">
                <div>
                <Heading>Mortality Rate</Heading>
                <Title as="p">{numeral(usStatesStats.mortality).format('0.0 %')}</Title>
                </div>
            </Level.Item>
            <Level.Item textAlign="centered">
                <div>
                <Heading>Recovery Rate</Heading>
                <Title as="p">{numeral(usStatesStats.recovery).format('0.0 %')}</Title>
                </div>
            </Level.Item>
        </Level>

        <hr />

        <Level>
            <Level.Item>
                <Heading>Top 10 Confirmed Cases (by State)</Heading>
            </Level.Item>
        </Level>

        <Level>
            <Level.Item>
                <GraphWithLoader 
                    graphName="Top 10 Confirmed Cases"
                    secondaryGraph="Top 10 Confirmed Cases"
                    graph={usStatesTop10}
                    width={width}
                    height={height}
                    selected={Object.keys(usStatesTop10)}
                />
            </Level.Item>
        </Level>

        <Level>
            <Level.Item>
                <Button color="primary" onClick={() => { dispatch(actions.clearGraphs()); history.push('/covid/us')}}>Compare U.S. Stats</Button>
            </Level.Item>
        </Level>

        <hr />
        
        <Level>
            <Level.Item>
                <Heading>Top U.S. Regions</Heading>
            </Level.Item>
        </Level>

        <Level>
            <Level.Item>
                <GraphWithLoader 
                    graphName="Top Regions Cases"
                    secondaryGraph="Top Regions Cases"
                    graph={confirmedUSRegions}
                    width={width}
                    height={height}
                    selected={['Midwest', 'Northeast', 'South', 'West']}
                />
            </Level.Item>
        </Level>

        <Level>
            <Level.Item>
                <Button color="primary" onClick={() => { dispatch(actions.clearGraphs()); history.push('/covid/us/regions')}}>Compare U.S. Regions</Button>
            </Level.Item>
        </Level>

        </>
    )    
}

export default DashboardContainer