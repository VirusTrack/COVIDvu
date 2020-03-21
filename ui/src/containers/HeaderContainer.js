import React from 'react'

import { useHistory, useLocation } from "react-router-dom"

import { useDispatch } from 'react-redux'

import { actions } from '../ducks/services'

import { Navbar, Title } from "rbx"

import VirusTrackLogo from '../images/virus-pngrepo-icon.png'

import store from 'store2'

import { 
    LAST_UPDATE_KEY, 
    GLOBAL_KEY, 
    CONTINENTAL_KEY,
    US_STATES_KEY, 
    US_REGIONS_KEY, 
    CACHE_INVALIDATE_GLOBAL_KEY, 
    CACHE_INVALIDATE_CONTINENTAL_KEY,
    CACHE_INVALIDATE_US_STATES_KEY, 
    CACHE_INVALIDATE_US_REGIONS_KEY 
} from '../constants'

import ReactGA from 'react-ga';

import compassImg from '../images/fa-icon-compass.svg'
import globeImg from '../images/fa-icon-globe.svg'
import usflagImg from '../images/fa-icon-usflag.svg'
import chartImg from '../images/fa-icon-chart.svg'
import syncImg from '../images/fa-icon-sync.svg'
import infoImg from '../images/fa-icon-info.svg'

export const HeaderContainer = () => {
    const history = useHistory()
    const dispatch = useDispatch()
    const location = useLocation()

    const selectedNav = location.pathname

    ReactGA.initialize('UA-574325-5');
    ReactGA.pageview(window.location.pathname + window.location.search);

    const forceRefresh = () => {
        store.session.remove(LAST_UPDATE_KEY)
        store.session.remove(GLOBAL_KEY)
        store.session.remove(CONTINENTAL_KEY)
        store.session.remove(US_STATES_KEY)
        store.session.remove(US_REGIONS_KEY)
        store.session.remove(CACHE_INVALIDATE_GLOBAL_KEY)
        store.session.remove(CACHE_INVALIDATE_CONTINENTAL_KEY)
        store.session.remove(CACHE_INVALIDATE_US_STATES_KEY)
        store.session.remove(CACHE_INVALIDATE_US_REGIONS_KEY)
    
        dispatch(actions.clearGraphs())
        dispatch(actions.fetchGlobal())
        dispatch(actions.fetchUSStates())
        dispatch(actions.fetchUSRegions())
        dispatch(actions.fetchContinental())
        dispatch(actions.fetchTop10Countries({
            excludeChina: true
        }))
        dispatch(actions.fetchTotalGlobalStats())

        dispatch(actions.fetchTop10USStates())
        dispatch(actions.fetchTotalUSStatesStats())

    }

    const changePage = (pageLocation) => {
        if(location.pathname !== pageLocation) {
            dispatch(actions.clearGraphs())
            history.push('/dashboard')
        }
    }

    return (
        <Navbar>
            <Navbar.Brand>
                <Navbar.Item onClick={() => { dispatch(actions.clearGraphs()); changePage('/dashboard') }}>
                    <img src={VirusTrackLogo} alt="VirusTrack" role="presentation" className="logomark"/>
                    <Title size={5} title="Coronavirus COVID-19 Cases"><span>Virus</span>Track</Title>
                </Navbar.Item>
                <Navbar.Burger />
            </Navbar.Brand>
            <Navbar.Menu>
                <Navbar.Segment align="start">
                    <Navbar.Item active={selectedNav === '/dashboard'} onClick={()=>{dispatch(actions.clearGraphs());changePage('/dashboard')}}><img src={compassImg} alt=""/>Dashboard</Navbar.Item>
                    
                    <Navbar.Item hoverable dropdown>
                        <Navbar.Link arrowless 
                            onClick={()=>{dispatch(actions.clearGraphs()); history.push('/covid')}}
                            active={selectedNav === '/covid' || selectedNav === '/covid/continental'}>
                                <img src={globeImg} alt=""/>Global
                        </Navbar.Link>
                        <Navbar.Dropdown boxed>
                            <Navbar.Item active={selectedNav === '/covid'} onClick={()=>{dispatch(actions.clearGraphs()); history.push('/covid')}}>Countries</Navbar.Item>
                            <Navbar.Item active={selectedNav === '/covid/continental'} onClick={()=>{dispatch(actions.clearGraphs()); history.push('/covid/continental')}}>Continental</Navbar.Item>
                        </Navbar.Dropdown>
                    </Navbar.Item>

                    <Navbar.Item hoverable dropdown>
                        <Navbar.Link arrowless onClick={() => {dispatch(actions.clearGraphs()); history.push('/covid/us')}}><img src={usflagImg} alt=""/>United States</Navbar.Link>
                        <Navbar.Dropdown boxed>
                            <Navbar.Item active={selectedNav === '/covid/us'} onClick={() => {dispatch(actions.clearGraphs()); history.push('/covid/us')}}>US States</Navbar.Item>
                            <Navbar.Item active={selectedNav === '/covid/us/regions'} onClick={()=>{dispatch(actions.clearGraphs()); history.push('/covid/us/regions')}}>US Regions</Navbar.Item>
                        </Navbar.Dropdown>
                    </Navbar.Item>
                    
                    <Navbar.Item active={selectedNav === '/stats'} onClick={()=>{dispatch(actions.clearGraphs()); history.push('/stats')}}><img src={chartImg} alt=""/>Stats</Navbar.Item>
                </Navbar.Segment>

                <Navbar.Segment align="end">
                    <Navbar.Item onClick={() => { forceRefresh() }}><img src={syncImg} alt=""/>Refresh</Navbar.Item>
                    <Navbar.Item active={selectedNav === '/about'} onClick={()=>{history.push('/about')}}><img src={infoImg} alt=""/>About</Navbar.Item>
                </Navbar.Segment>
            </Navbar.Menu>
        </Navbar>
    )

}

export default HeaderContainer
