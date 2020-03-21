import React, { useEffect } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { useHistory } from 'react-router'

import { useInterval } from '../hooks/ui'

import { actions } from '../ducks/services'

import { Tag, Title, Level, Heading, Container, Button, Box, Column } from "rbx"

import GraphWithLoader from '../components/GraphWithLoader'
import HeroElement from '../components/HeroElement'

import { CACHE_INVALIDATE_GLOBAL_KEY, CACHE_INVALIDATE_US_STATES_KEY, CACHE_INVALIDATE_CONTINENTAL_KEY, CACHE_INVALIDATE_US_REGIONS_KEY, ONE_MINUTE } from '../constants'

import numeral from 'numeral'

import store from 'store2'

import moment from 'moment'

import globeImg from '../images/fa-icon-globe.svg'
import usflagImg from '../images/fa-icon-usflag.svg'

export const DashboardContainer = () => {

    const session = store.session
    const dispatch = useDispatch()
    const history = useHistory()

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

    return (
        <>
        <HeroElement
            title={
                <>Coronavirus Cases <br />COVID-19 Cases</>
            }
            buttons={[
                { title: 'Global', location: '/covid' },
                { title: 'United States', location: '/covid/us' },
            ]}
        >
            { lastUpdate && 
                <Tag as="p">Last updated: {moment(lastUpdate).format('YYYY-MM-DD HH:mm:ss')}</Tag>
            }
        </HeroElement>

        <Box>
            <Title size={2}><img src={globeImg} alt=""/>Global Coronavirus Totals</Title>
            <Column.Group breakpoint="desktop" gapless className="separated">
            <Column narrow>

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
                            <Heading>Mortality Rate</Heading>
                            <Title as="p">{numeral(globalStats.mortality).format('0.0 %')}</Title>
                            </div>
                        </Level.Item>
                        <Level.Item textAlign="centered">
                            <div>
                            <Heading>New Deaths (as of today)</Heading>
                            { renderChangeDifference(globalStats.newDeaths)}
                            </div>
                        </Level.Item>
                    </Level>
                </Container>
            </Column>
                
            <Column>
                <Container className="chart">
                    <Title size={2} align="center">
                        <Heading align="center">Top 10 Confirmed</Heading>
                        Cases by Country
                    </Title>
                    <GraphWithLoader 
                        graphName="Top 10 Confirmed Cases"
                        secondaryGraph="Top 10 Confirmed Cases"
                        graph={globalTop10}
                        selected={['Italy', 'Iran', 'Korea, South', 'Spain', 'Germany', 'France', 'US', 'Switzerland', 'United Kingdom', 'Netherlands']}
                    />
                </Container>
            </Column>

            <Column>
                <Container className="chart">
                    <Title size={2} align="center">
                        <Heading align="center">Top 10 Confirmed</Heading>
                        Cases by Continent
                    </Title>
                    <GraphWithLoader 
                        graphName="continental_graph"
                        secondaryGraph="continental_graph"
                        graph={confirmedContinental}
                        selected={['North America', 'Asia', 'Europe', 'South America']}
                        style={{width: '100%', height: '100%'}}
                    />
                </Container>
            </Column>

            </Column.Group>

            <Button.Group align="center">
                <Button size="large" color="primary" onClick={() => { dispatch(actions.clearGraphs()); history.push('/covid')}}>Compare Country Stats</Button>
                <Button size="large" color="primary" onClick={() => { dispatch(actions.clearGraphs()); history.push('/covid/continental')}}>Compare Continental Stats</Button>
            </Button.Group>
        </Box>



        <Box>

            <Title size={2}><img src={usflagImg} alt=""/>United States Coronavirus Totals</Title>
            <Column.Group gapless breakpoint="desktop" className="separated">
            <Column size="narrow"> 
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
                        <Heading>Mortality Rate</Heading>
                        <Title as="p">{numeral(usStatesStats.mortality).format('0.0 %')}</Title>
                        </div>
                    </Level.Item>

                    <Level.Item textAlign="centered">
                        <div>
                        <Heading>New Deaths (as of today)</Heading>
                        { renderChangeDifference(usStatesStats.newDeaths)}
                        </div>
                    </Level.Item>               
                </Level>
            </Container>
            </Column>

            <Column className="chart">
                <Title size={2} align="center"><Heading>Top 10 Confirmed</Heading>Cases by State</Title>
                <GraphWithLoader 
                    graphName="Top 10 Confirmed Cases"
                    secondaryGraph="Top 10 Confirmed Cases"
                    graph={usStatesTop10}
                    selected={['New York', 'Washington', 'California', 'Massachusetts', 'New Jersey', 'Colorado', 'Florida', 'Louisiana', 'Georgia', 'Illinois']}
                />
            </Column>

            <Column className="chart">
                <Title size={2} align="center"><Heading>Top Coronavirus Cases</Heading>By U.S. Region</Title>
                <GraphWithLoader 
                    graphName="Top Regions Cases"
                    secondaryGraph="Top Regions Cases"
                    graph={confirmedUSRegions}
                    selected={['Midwest', 'Northeast', 'South', 'West']}
                />
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