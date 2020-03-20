import React, { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { useHistory } from 'react-router'

import { useWindowSize, useInterval } from '../hooks/ui'

import { actions } from '../ducks/services'

import { Hero, Tag, Title, Level, Heading, Container, Button, Box, Column } from "rbx"

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
        
        const greenColor = {color: 'hsl(188, 80%, 38%)'}
        const redColor = {color: 'hsl(5, 87%, 70%)'}

        const colorBasedOnChange = value >= 0 ? redColor : greenColor

        return (
            <Title as="p" style={colorBasedOnChange}>{numeral(value).format('+0,0')}</Title>
        )
    }

    return (
        <>
        <Hero size="medium">
            <Hero.Body>
            <Container>
                <Title size={1}>Coronavirus <br/>COVID-19 Cases</Title>
                <Button.Group>
                    <Button size="large" color="primary">Global</Button>
                    <Button size="large" color="primary">United States</Button>
                </Button.Group>
                { lastUpdate && 
                        <Tag as="p">Last updated: {moment(lastUpdate).format('YYYY-MM-DD HH:mm:ss')}</Tag>
                    }
            </Container>
            </Hero.Body>
        </Hero>
       
        <Box>

            <Title size={4}>Today's Global Totals</Title>
            <hr/>
            <Level>
            <Level.Item>
            <Container className="statistics">
                <Level>
                    <Level.Item textAlign="centered">
                        <div>
                        <Heading>Total Cases</Heading>
                        <Title as="p">{numeral(globalTotal.confirmed).format('0,0')}</Title>
                        </div>
                    </Level.Item>
                    
                </Level>        
                
                <Level breakpoint="mobile">
                    <Level.Item textAlign="centered">
                        <div>
                        <Heading>Total Deaths</Heading>
                        <Title as="p">{numeral(globalTotal.deaths).format('0,0')}</Title>
                        </div>
                    </Level.Item>
                    <Level.Item textAlign="centered">
                        <div>
                        <Heading>New Cases (as of today)</Heading>
                        { renderChangeDifference(globalTotal.newConfirmed)}
                        </div>
                    </Level.Item>
                </Level>

                <Level breakpoint="mobile"> 
                    
                    <Level.Item textAlign="centered">
                        <div>
                        <Heading>Recovered</Heading>
                        <Title as="p">{numeral(globalTotal.recovered).format('0,0')}</Title>
                        </div>
                    </Level.Item>

                    <Level.Item textAlign="centered">
                        <div>
                        <Heading>New Deaths (as of today)</Heading>
                        { renderChangeDifference(globalTotal.newDeaths)}
                        </div>
                    </Level.Item>
                </Level>

                <Level breakpoint="mobile">
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
            </Container>
            <hr />
            </Level.Item>

            <Level.Item>
            <Container className="chart">
                <Title size={2} align="center">
                    <Heading align="center">Top 10 Confirmed</Heading>
                    Cases by Country
                </Title>
                

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
            </Container>
            </Level.Item>
            </Level>
            <hr />

            <Button.Group align="center">
                <Button size="large" color="primary" onClick={() => { dispatch(actions.clearGraphs()); history.push('/covid')}}>Compare Country Stats</Button>
            </Button.Group>

        </Box>
        <Box>

            <Title size={4}>Today's United States Totals</Title>
            <hr/>
            <Column.Group>
            <Column size={4}> 
            <Container className="statistics">
                <Level>
                    <Level.Item textAlign="centered">
                        <div>
                        <Heading>Total Cases</Heading>
                        <Title as="p">{numeral(usTotal.confirmed).format('0,0')}</Title>
                        </div>
                    </Level.Item>
                    
                </Level>        
                
                <Level breakpoint="mobile">
                    <Level.Item textAlign="centered">
                        <div>
                        <Heading>Total Deaths</Heading>
                        <Title as="p">{numeral(usTotal.deaths).format('0,0')}</Title>
                        </div>
                    </Level.Item>
                    <Level.Item textAlign="centered">
                        <div>
                        <Heading>New Cases (as of today)</Heading>
                        { renderChangeDifference(usTotal.newConfirmed)}
                        </div>
                    </Level.Item>
                </Level>

                <Level breakpoint="mobile"> 
                    
                    <Level.Item textAlign="centered">
                        <div>
                        <Heading>Recovered</Heading>
                        <Title as="p">{numeral(usTotal.recovered).format('0,0')}</Title>
                        </div>
                    </Level.Item>

                    <Level.Item textAlign="centered">
                        <div>
                        <Heading>New Deaths (as of today)</Heading>
                        { renderChangeDifference(usTotal.newDeaths)}
                        </div>
                    </Level.Item>
                </Level>

                <Level breakpoint="mobile">
                    <Level.Item textAlign="centered">
                        <div>
                        <Heading>Recovery Rate</Heading>
                        <Title as="p">{numeral(usTotal.recovery).format('0.0 %')}</Title>
                        </div>
                    </Level.Item>
                    <Level.Item textAlign="centered">
                        <div>
                        <Heading>Mortality Rate</Heading>
                        <Title as="p">{numeral(usTotal.mortality).format('0.0 %')}</Title>
                        </div>
                    </Level.Item>
                </Level>
            </Container>
            </Column>

            <Column size={4}>
                
                <Title size={2} align="center"><Heading>Top 10 Confirmed</Heading>Cases by State</Title>
    
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

            </Column>
            <Column size={4}>
                <Title size={2} align="center"><Heading>Top Coronavirus Cases</Heading>By U.S. Region</Title>

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
            </Column>
            </Column.Group>

            <Button.Group align="center">
                <Button size="large" color="primary" onClick={() => { dispatch(actions.clearGraphs()); history.push('/covid/us')}}>Compare U.S. Regions</Button>
            </Button.Group>
        </Box>

        </>
    )    
}

export default DashboardContainer