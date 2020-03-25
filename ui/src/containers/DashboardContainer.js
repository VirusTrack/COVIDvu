import React, { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { useHistory } from 'react-router'

import { useInterval } from '../hooks/ui'

import { actions } from '../ducks/services'

import { Tag, Title, Level, Heading, Container, Button, Box, Column } from "rbx"

import GraphWithLoader from '../components/GraphWithLoader'
import HeroElement from '../components/HeroElement'
import LogoElement from '../components/LogoElement'

import { CACHE_INVALIDATE_GLOBAL_KEY, CACHE_INVALIDATE_US_STATES_KEY, CACHE_INVALIDATE_CONTINENTAL_KEY, CACHE_INVALIDATE_US_REGIONS_KEY, ONE_MINUTE } from '../constants'

import GraphScaleControl from '../components/GraphScaleControl'

import numeral from 'numeral'

import store from 'store2'

import moment from 'moment'

import globeImg from '../images/fa-icon-globe.svg'
import usflagImg from '../images/fa-icon-usflag.svg'

export const DashboardContainer = ({showLogParam = false}) => {
    const dispatch = useDispatch()
    const history = useHistory()

    const [showLog, setShowLog] = useState(showLogParam)
    const graphControlsAlign = 'center'

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
        if(store.session.get(CACHE_INVALIDATE_GLOBAL_KEY)) {
            dispatch(actions.fetchTop10Countries({
                excludeChina: true
            }))
            dispatch(actions.fetchTotalGlobalStats())
        }
        if(store.session.get(CACHE_INVALIDATE_US_STATES_KEY)) {
            dispatch(actions.fetchTop10USStates())
            dispatch(actions.fetchTotalUSStatesStats())
        }
        if(store.session.get(CACHE_INVALIDATE_US_REGIONS_KEY)) {
            dispatch(actions.fetchUSRegions())
        }
        if(store.session.get(CACHE_INVALIDATE_CONTINENTAL_KEY)) {
            dispatch(actions.fetchContinental())
        }
    }, ONE_MINUTE)

    const lastUpdate = useSelector(state => state.services.lastUpdate)

    useEffect(() => {
        dispatch(actions.fetchLastUpdate())
    }, [dispatch])

    const globalTop10 = useSelector(state => state.services.globalTop10)
    const globalNamesTop10 = useSelector(state => state.services.globalNamesTop10)
    const globalStats = useSelector(state => state.services.totalGlobalStats)
    
    const usStatesTop10 = useSelector(state => state.services.usStatesTop10)
    const usStateNamesTop10 = useSelector(state => state.services.usStateNamesTop10)
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

    const handleGraphScale = (logScale) => {
        setShowLog(logScale)
    }

    return (
        <>
        <HeroElement
            title={
                <>Coronavirus <br />COVID-19 Cases</>
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
            <Title size={2}>
                <LogoElement size="small" />
                <img src={globeImg} alt=""/>Global Coronavirus Totals</Title>
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
 
                    <GraphScaleControl
                        showLog={showLog}
                        handleGraphScale={handleGraphScale}
                        secondaryGraph={globalTop10}
                        align={graphControlsAlign}
                    />
                    <GraphWithLoader 
                        graphName="Top 10 Confirmed Cases"
                        secondaryGraph="Top 10 Confirmed Cases"
                        graph={globalTop10}
                        showLog={showLog}
                        selected={globalNamesTop10}
                    />
                    
                </Container>
            </Column>

            <Column>
                <Container className="chart">
                    <Title size={2} align="center">
                        <Heading align="center">Top 10 Confirmed</Heading>
                        Cases by Continent
                    </Title>
                    
                    <GraphScaleControl
                        showLog={showLog}
                        handleGraphScale={handleGraphScale}
                        secondaryGraph={confirmedContinental}
                        align={graphControlsAlign}
                    />
                    <GraphWithLoader 
                        graphName="continental_graph"
                        secondaryGraph="continental_graph"
                        graph={confirmedContinental}
                        showLog={showLog}
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

            <Title size={2}>
                <LogoElement size="small" />
                <img src={usflagImg} alt=""/>United States Coronavirus Totals
            </Title>
            <Column.Group gapless breakpoint="desktop" className="separated">
            <Column narrow> 
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
                
                <GraphScaleControl
                        showLog={showLog}
                        handleGraphScale={handleGraphScale}
                        secondaryGraph={usStateNamesTop10}
                        align={graphControlsAlign}
                    />
                <GraphWithLoader 
                    graphName="Top 10 Confirmed Cases"
                    secondaryGraph="Top 10 Confirmed Cases"
                    graph={usStatesTop10}
                    showLog={showLog}
                    selected={usStateNamesTop10}
                />
            </Column>

            <Column className="chart">
                <Title size={2} align="center"><Heading>Top Coronavirus Cases</Heading>By U.S. Region</Title>
                
                
                <GraphScaleControl
                    showLog={showLog}
                    handleGraphScale={handleGraphScale}
                    secondaryGraph={confirmedUSRegions}
                    align={graphControlsAlign}
                />
                <GraphWithLoader 
                    graphName="Top Regions Cases"
                    secondaryGraph="Top Regions Cases"
                    graph={confirmedUSRegions}
                    showLog={showLog}
                    selected={['Midwest', 'Northeast', 'South', 'West']}
                />
                
            </Column>
            </Column.Group>

            <Button.Group align="center">
                <Button size="large" color="primary" onClick={() => { dispatch(actions.clearGraphs()); history.push('/covid/us')}}>Compare U.S. States</Button>
                <Button size="large" color="primary" onClick={() => { dispatch(actions.clearGraphs()); history.push('/covid/us/regions')}}>Compare U.S. Regions</Button>
            </Button.Group>
        </Box>

        </>
    )    
}

export default DashboardContainer