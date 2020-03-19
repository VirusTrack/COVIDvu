import React, { useEffect, useState } from 'react'

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
        dispatch(actions.fetchGlobal())
        dispatch(actions.fetchUSStates())
        dispatch(actions.fetchUSRegions())
    }, [dispatch])

    useInterval(() => {
        if(store.get(CACHE_INVALIDATE_GLOBAL_KEY)) {
            dispatch(actions.fetchGlobal())
        }
        if(store.get(CACHE_INVALIDATE_US_STATES_KEY)) {
            dispatch(actions.fetchUSStates())
        }
        if(store.get(CACHE_INVALIDATE_US_REGIONS_KEY)) {
            dispatch(actions.fetchUSRegions())
        }
    }, ONE_MINUTE)

    const lastUpdate = useSelector(state => state.services.lastUpdate)

    const [width, height] = useWindowSize()

    const [globalTotal, setGlobalTotal] = useState({
        confirmed: 0,
        deaths: 0,
        mortality: 0,
        recovered: 0,
        recovery: 0,
        newConfirmed: 0,
        newDeaths: 0
    })

    const [usTotal, setUSTotal] = useState({
        confirmed: 0,
        deaths: 0,
        mortality: 0,
        recovered: 0,
        recovery: 0
    })

    useEffect(() => {
        dispatch(actions.fetchLastUpdate())
    }, [dispatch])

    const confirmed = useSelector(state => state.services.global.confirmed)
    const confirmedUS = useSelector(state => state.services.usStates.confirmed)
    const confirmedUSRegions = useSelector(state => state.services.usRegions.confirmed)

    const statsTotals = useSelector(state => state.services.global.statsTotals)
    const usStatsTotals = useSelector(state => state.services.usStates.statsTotals)

    useEffect(() => {

        if(statsTotals) {

            const byRegion = statsTotals.reduce((obj, item) => {
                obj[item.region] = item
                return obj
            }, {})

            // setGlobalTotalsByRegion(byRegion)
            setGlobalTotal({
                confirmed: byRegion['!Global'].confirmed,
                deaths: byRegion['!Global'].deaths,
                mortality: byRegion['!Global'].mortality,
                recovered: byRegion['!Global'].recovered,
                recovery: byRegion['!Global'].recovery,
                newConfirmed: byRegion['!Global'].confirmedDayChange,
                newDeaths: byRegion['!Global'].deathsDayChange,
            })
        }
    }, [statsTotals])

    useEffect(() => {

        if(usStatsTotals) {
            const byRegion = usStatsTotals.reduce((obj, item) => {
                obj[item.region] = item
                return obj
            }, {})

            // setUSTotalsByRegion(byRegion)
            setUSTotal({
                confirmed: byRegion['!Total US'].confirmed,
                deaths: byRegion['!Total US'].deaths,
                mortality: byRegion['!Total US'].mortality,
                recovered: byRegion['!Total US'].recovered,
                recovery: byRegion['!Total US'].recovery,
                newConfirmed: byRegion['!Total US'].confirmedDayChange,
                newDeaths: byRegion['!Total US'].deathsDayChange,
            })
        }
    }, [usStatsTotals])

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
                <Title as="p">{numeral(globalTotal.confirmed).format('0,0')}</Title>
                </div>
            </Level.Item>
            <Level.Item textAlign="centered">
                <div>
                <Heading>Total Deaths</Heading>
                <Title as="p">{numeral(globalTotal.deaths).format('0,0')}</Title>
                </div>
            </Level.Item>
        </Level>        
        
        <Level>
            <Level.Item textAlign="centered">
                <div>
                <Heading>New Cases (as of today)</Heading>
                { renderChangeDifference(globalTotal.newConfirmed)}
                </div>
            </Level.Item>
            <Level.Item textAlign="centered">
                <div>
                <Heading>New Deaths (as of today)</Heading>
                { renderChangeDifference(globalTotal.newDeaths)}
                </div>
            </Level.Item>
        </Level>
        <Level>
            <Level.Item textAlign="centered">
                <div>
                <Heading>Recovery Rate</Heading>
                <Title as="p">{numeral(globalTotal.recovery).format('0.0 %')}</Title>
                </div>
            </Level.Item>
            <Level.Item textAlign="centered">
                <div>
                <Heading>Mortality Rate</Heading>
                <Title as="p">{numeral(globalTotal.mortality).format('0.0 %')}</Title>
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
                    graph={confirmed}
                    width={width}
                    height={height}
                    selected={['Italy', 'Iran', 'Korea, South', 'Spain', 'Germany', 'France', 'US', 'Switzerland', 'United Kingdom', 'Netherlands']}
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
                <Title as="p">{numeral(usTotal.confirmed).format('0,0')}</Title>
                </div>
            </Level.Item>
            <Level.Item textAlign="centered">
                <div>
                <Heading>Total Deaths</Heading>
                <Title as="p">{numeral(usTotal.deaths).format('0,0')}</Title>
                </div>
            </Level.Item>
        </Level>        
        

        <Level>
            <Level.Item textAlign="centered">
                <div>
                <Heading>New Cases</Heading>
                { renderChangeDifference(usTotal.newConfirmed)}
                </div>
            </Level.Item>
            <Level.Item textAlign="centered">
                <div>
                <Heading>New Deaths</Heading>
                { renderChangeDifference(usTotal.newDeaths)}
                </div>
            </Level.Item>
        </Level>

        <Level>
            <Level.Item textAlign="centered">
                <div>
                <Heading>Mortality Rate</Heading>
                <Title as="p">{numeral(usTotal.mortality).format('0.0 %')}</Title>
                </div>
            </Level.Item>
            <Level.Item textAlign="centered">
                <div>
                <Heading>Recovery Rate</Heading>
                <Title as="p">{numeral(usTotal.recovery).format('0.0 %')}</Title>
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
                    graph={confirmedUS}
                    width={width}
                    height={height}
                    selected={['New York', 'Washington', 'California', 'Massachusetts', 'New Jersey', 'Colorado', 'Florida', 'Louisiana', 'Georgia', 'Illinois']}
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