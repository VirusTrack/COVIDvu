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
        recovery: 0
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
    const deaths = useSelector(state => state.services.global.deaths)
    const recovered = useSelector(state => state.services.global.recovered)

    const confirmedUS = useSelector(state => state.services.usStates.confirmed)
    const deathsUS = useSelector(state => state.services.usStates.deaths)
    const recoveredUS = useSelector(state => state.services.usStates.recovered)

    const confirmedUSRegions = useSelector(state => state.services.usRegions.confirmed)
    // const sortedConfirmed = useSelector(state => state.services.global.sortedConfirmed)

    const statsTotals = useSelector(state => state.services.global.statsTotals)
    const usStatsTotals = useSelector(state => state.services.usStates.statsTotals)

    const [globalMergedStats, setGlobalMergedStats] = useState(null)
    const [usMergedStats, setUSMergedStats] = useState(null)

    useEffect(() => {

        if(statsTotals) {
            for(const stat of statsTotals) {
                if(stat.region === '!Global') {
                    setGlobalTotal(stat)
                }
            }
        }
    }, [statsTotals])

    useEffect(() => {

        if(usStatsTotals) {
            for(const stat of usStatsTotals) {
                if(stat.region === '!Total US') {
                    setUSTotal(stat)
                }
            }
        }
    }, [usStatsTotals])


    useEffect(() => {

        if(confirmed && deaths && recovered) {
            let merged = {
                'Confirmed': confirmed['!Global'],
                'Deaths': deaths['!Global'],
                'Recovered': recovered['!Global']
            }

            setGlobalMergedStats(merged)
        }
    }, [confirmed, deaths, recovered])

    useEffect(() => {

        if(confirmedUS && deathsUS && recoveredUS) {
            let merged = {
                'Confirmed': confirmedUS['!Total US'],
                'Deaths': deathsUS['!Total US'],
                'Recovered': recoveredUS['!Total US']
            }

            setUSMergedStats(merged)
        }
    }, [confirmedUS, deathsUS, recoveredUS])

    return (
        <>
        <Level>
            <Level.Item>
                { lastUpdate && 
                    <Tag size="large" color="primary">Last updated: {moment(lastUpdate).format('YYYY-MM-DD HH:mm:ss')}</Tag>
                }
            </Level.Item>

        </Level>

        <Level>
            <Level.Item>
                <Title size={3}>Global</Title>
            </Level.Item>
        </Level>


        <Level>
            <Level.Item textAlign="centered">
                <div>
                <Heading>Confirmed</Heading>
                <Title as="p">{numeral(globalTotal.confirmed).format('0,0')}</Title>
                </div>
            </Level.Item>
            <Level.Item textAlign="centered">
                <div>
                <Heading>Deaths</Heading>
                <Title as="p">{numeral(globalTotal.deaths).format('0,0')}</Title>
                </div>
            </Level.Item>
            <Level.Item textAlign="centered">
                <div>
                <Heading>Recovered</Heading>
                <Title as="p">{numeral(globalTotal.recovered).format('0,0')}</Title>
                </div>
            </Level.Item>
        </Level>        
        
        <Level>
            <Level.Item textAlign="centered">
                <div>
                <Heading>Mortality Rate</Heading>
                <Title as="p">{numeral(globalTotal.mortality).format('0.0 %')}</Title>
                </div>
            </Level.Item>
            <Level.Item textAlign="centered">
                <div>
                <Heading>Recovery Rate</Heading>
                <Title as="p">{numeral(globalTotal.recovery).format('0.0 %')}</Title>
                </div>
            </Level.Item>
        </Level>

        <hr />

        <Level>
            <Level.Item>
                <Heading>Top 10 Confirmed</Heading>
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
                <Button color="primary" onClick={() => { dispatch(actions.clearGraphs()); history.push('/covid')}}>View Global Graphs</Button>
            </Level.Item>
        </Level>

        <hr />


        <Level>
            <Level.Item>
                <Title size={3}>United States</Title>
            </Level.Item>
        </Level>

        <Level>
            <Level.Item textAlign="centered">
                <div>
                <Heading>Confirmed</Heading>
                <Title as="p">{numeral(usTotal.confirmed).format('0,0')}</Title>
                </div>
            </Level.Item>
            <Level.Item textAlign="centered">
                <div>
                <Heading>Deaths</Heading>
                <Title as="p">{numeral(usTotal.deaths).format('0,0')}</Title>
                </div>
            </Level.Item>
            <Level.Item textAlign="centered">
                <div>
                <Heading>Recovered</Heading>
                <Title as="p">{numeral(usTotal.recovered).format('0,0')}</Title>
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
                <Heading>Top 10 Confirmed</Heading>
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
                <Button color="primary" onClick={() => { dispatch(actions.clearGraphs()); history.push('/covid/us')}}>View US State Graphs</Button>
            </Level.Item>
        </Level>

        <hr />
        
        <Level>
            <Level.Item>
                <Heading>Top Regions</Heading>
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
                <Button color="primary" onClick={() => { dispatch(actions.clearGraphs()); history.push('/covid/us/regions')}}>View US Region Graphs</Button>
            </Level.Item>
        </Level>

        </>
    )    
}

export default DashboardContainer