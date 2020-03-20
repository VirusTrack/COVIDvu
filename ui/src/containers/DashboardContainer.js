import React, { useEffect } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { useHistory } from 'react-router'

import { useWindowSize, useInterval } from '../hooks/ui'

import { actions } from '../ducks/services'

import { Hero, Tag, Title, Level, Heading, Container, Button, Box, Column } from "rbx"

import GraphWithLoader from '../components/GraphWithLoader'

import { CACHE_INVALIDATE_GLOBAL_KEY, CACHE_INVALIDATE_US_STATES_KEY, CACHE_INVALIDATE_CONTINENTAL_KEY, CACHE_INVALIDATE_US_REGIONS_KEY, ONE_MINUTE } from '../constants'

import numeral from 'numeral'

import store from 'store2'

import moment from 'moment'

export const DashboardContainer = () => {

    const session = store.session
    const dispatch = useDispatch()
    const history = useHistory()

    useEffect(() => {
        console.log("Same ")
    }, [])

    useEffect(() => {
        dispatch(actions.fetchTop10Countries({
            excludeChina: true
        }))
        dispatch(actions.fetchTotalGlobalStats())

        dispatch(actions.fetchTop10USStates())
        dispatch(actions.fetchTotalUSStatesStats())

        dispatch(actions.fetchUSRegions())
        dispatch(actions.fetchContinental())

    }, [dispatch])

    useInterval(() => {
        if(session.get(CACHE_INVALIDATE_GLOBAL_KEY)) {
            dispatch(actions.fetchTop10Countries({
                excludeChina: true
            }))
            dispatch(actions.fetchTotalGlobalStats())
        }
        if(session.get(CACHE_INVALIDATE_US_STATES_KEY)) {
            dispatch(actions.fetchTop10USStates())
            dispatch(actions.fetchTotalUSStatesStats())
        }
        if(session.get(CACHE_INVALIDATE_US_REGIONS_KEY)) {
            dispatch(actions.fetchUSRegions())
        }
        if(session.get(CACHE_INVALIDATE_CONTINENTAL_KEY)) {
            dispatch(actions.fetchContinental())
        }
    }, ONE_MINUTE)

    const lastUpdate = useSelector(state => state.services.lastUpdate)

    const [width, height] = useWindowSize()

    useEffect(() => {
        dispatch(actions.fetchLastUpdate())
    }, [dispatch])

    const globalTop10 = useSelector(state => state.services.globalTop10)
    const globalStats = useSelector(state => state.services.totalGlobalStats)
    
    const usStatesTop10 = useSelector(state => state.services.usStatesTop10)
    const usStatesStats = useSelector(state => state.services.totalUSStatesStats)
    
    const confirmedUSRegions = useSelector(state => state.services.usRegions.confirmed)
    const confirmedContinental = useSelector(state => state.services.continental.confirmed)

    const renderChangeDifference = (value) => {
        
        const greenColor = {color: 'hsl(188, 80%, 38%)'}
        const redColor = {color: 'hsl(5, 87%, 70%)'}

        const colorBasedOnChange = value >= 0 ? redColor : greenColor

        return (
            <Title as="p" style={colorBasedOnChange}>{numeral(value).format('+0,0')}</Title>
        )
    }

    const HeroElement = (props) => {
        return (
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
        )
    }

    return (
        <>
        <HeroElement />
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
                        <Title as="p">{numeral(globalStats.confirmed).format('0,0')}</Title>
                        </div>
                    </Level.Item>
                    
                </Level>        
                
                <Level breakpoint="mobile">
                    <Level.Item textAlign="centered">
                        <div>
                        <Heading>Total Deaths</Heading>
                        <Title as="p">{numeral(globalStats.deaths).format('0,0')}</Title>
                        </div>
                    </Level.Item>
                    <Level.Item textAlign="centered">
                        <div>
                        <Heading>New Cases (as of today)</Heading>
                        { renderChangeDifference(globalStats.newConfirmed)}
                        </div>
                    </Level.Item>
                </Level>

                <Level breakpoint="mobile"> 
                    
                    <Level.Item textAlign="centered">
                        <div>
                        <Heading>Recovered</Heading>
                        <Title as="p">{numeral(globalStats.recovered).format('0,0')}</Title>
                        </div>
                    </Level.Item>

                    <Level.Item textAlign="centered">
                        <div>
                        <Heading>New Deaths (as of today)</Heading>
                        { renderChangeDifference(globalStats.newDeaths)}
                        </div>
                    </Level.Item>
                </Level>

                <Level breakpoint="mobile">
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
                            graph={globalTop10}
                            width={width}
                            height={height}
                            selected={['Italy', 'Iran', 'Korea, South', 'Spain', 'Germany', 'France', 'US', 'Switzerland', 'United Kingdom', 'Netherlands']}
                        />
                    </Level.Item>
                </Level>
            </Container>
            </Level.Item>

            <Level.Item>
                <Container className="chart">
                    <Title size={2} align="center">
                        <Heading align="center">Top 10 Confirmed</Heading>
                        Cases by Continent
                    </Title>

                    <Level>
                        <Level.Item>
                            <GraphWithLoader 
                                graphName="continental_graph"
                                secondaryGraph="continental_graph"
                                graph={confirmedContinental}
                                width={width}
                                height={height}
                                selected={['North America', 'Asia', 'Europe', 'South America']}
                            />
                        </Level.Item>
                    </Level>

                </Container>
            </Level.Item>
        </Level>

            <Button.Group align="center">
                <Button size="large" color="primary" onClick={() => { dispatch(actions.clearGraphs()); history.push('/covid')}}>Compare Country Stats</Button>
                <Button size="large" color="primary" onClick={() => { dispatch(actions.clearGraphs()); history.push('/covid/continental')}}>Compare Continental Stats</Button>
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
                        <Title as="p">{numeral(usStatesStats.confirmed).format('0,0')}</Title>
                        </div>
                    </Level.Item>
                    
                </Level>        
                
                <Level breakpoint="mobile">
                    <Level.Item textAlign="centered">
                        <div>
                        <Heading>Total Deaths</Heading>
                        <Title as="p">{numeral(usStatesStats.deaths).format('0,0')}</Title>
                        </div>
                    </Level.Item>
                    <Level.Item textAlign="centered">
                        <div>
                        <Heading>New Cases (as of today)</Heading>
                        { renderChangeDifference(usStatesStats.newConfirmed)}
                        </div>
                    </Level.Item>
                </Level>

                <Level breakpoint="mobile"> 
                    
                    <Level.Item textAlign="centered">
                        <div>
                        <Heading>Recovered</Heading>
                        <Title as="p">{numeral(usStatesStats.recovered).format('0,0')}</Title>
                        </div>
                    </Level.Item>

                    <Level.Item textAlign="centered">
                        <div>
                        <Heading>New Deaths (as of today)</Heading>
                        { renderChangeDifference(usStatesStats.newDeaths)}
                        </div>
                    </Level.Item>
                </Level>

                <Level breakpoint="mobile">
                    <Level.Item textAlign="centered">
                        <div>
                        <Heading>Recovery Rate</Heading>
                        <Title as="p">{numeral(usStatesStats.recovery).format('0.0 %')}</Title>
                        </div>
                    </Level.Item>
                    <Level.Item textAlign="centered">
                        <div>
                        <Heading>Mortality Rate</Heading>
                        <Title as="p">{numeral(usStatesStats.mortality).format('0.0 %')}</Title>
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
                            graph={usStatesTop10}
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