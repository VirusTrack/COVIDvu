import React from 'react'

import { useHistory, useLocation } from "react-router-dom"

import { useDispatch } from 'react-redux'

import { actions } from '../ducks/services'

import { Navbar, Title } from "rbx"

import VirusTrackLogo from '../images/virus-pngrepo-icon.png'

import store from 'store'

import { 
    LAST_UPDATE_KEY, 
    GLOBAL_KEY, 
    US_STATES_KEY, 
    US_REGIONS_KEY, 
    CACHE_INVALIDATE_GLOBAL_KEY, 
    CACHE_INVALIDATE_US_STATES_KEY, 
    CACHE_INVALIDATE_US_REGIONS_KEY 
} from '../constants'

import ReactGA from 'react-ga';

export const HeaderContainer = () => {
    const history = useHistory()
    const dispatch = useDispatch()
    const location = useLocation()

    const selectedNav = location.pathname

    ReactGA.initialize('UA-574325-5');
    ReactGA.pageview(window.location.pathname + window.location.search);

    const forceRefresh = () => {
        store.remove(LAST_UPDATE_KEY)
        store.remove(GLOBAL_KEY)
        store.remove(US_STATES_KEY)
        store.remove(US_REGIONS_KEY)
        store.remove(CACHE_INVALIDATE_GLOBAL_KEY)
        store.remove(CACHE_INVALIDATE_US_STATES_KEY)
        store.remove(CACHE_INVALIDATE_US_REGIONS_KEY)
    
        dispatch(actions.clearGraphs())
        dispatch(actions.fetchGlobal())
        dispatch(actions.fetchUSStates())
        dispatch(actions.fetchUSRegions())
    }

    const changePage = (pageLocation) => {
        if(location.pathname !== pageLocation) {
            dispatch(actions.clearGraphs())
            history.push('/dashboard')
        }
    }

    return (
        <Navbar color="dark">
            <Navbar.Brand>
                <Navbar.Item onClick={() => { changePage('/dashboard') }}>
                    <img src={VirusTrackLogo} alt="" role="presentation" />&nbsp;
                    <Title style={{color: 'white'}} size={5}>Coronavirus COVID-19 Cases</Title>
                </Navbar.Item>
                <Navbar.Burger />
            </Navbar.Brand>
            <Navbar.Menu>
                <Navbar.Segment align="start">
                    <Navbar.Item active={selectedNav === '/dashboard'} onClick={()=>{changePage('/dashboard')}}>Dashboard</Navbar.Item>
                    <Navbar.Item active={selectedNav === '/covid'} onClick={()=>{dispatch(actions.clearGraphs()); history.push('/covid')}}>Global</Navbar.Item>
                    <Navbar.Item active={selectedNav === '/covid/us'} onClick={() => {dispatch(actions.clearGraphs()); history.push('/covid/us')}}>US States</Navbar.Item>
                    <Navbar.Item active={selectedNav === '/covid/us/regions'} onClick={()=>{dispatch(actions.clearGraphs()); history.push('/covid/us/regions')}}>US Regions</Navbar.Item>
                    <Navbar.Item active={selectedNav === '/stats'} onClick={()=>{dispatch(actions.clearGraphs()); history.push('/stats')}}>Stats</Navbar.Item>
                </Navbar.Segment>

                <Navbar.Segment align="end">
                    <Navbar.Item onClick={() => { forceRefresh() }}>Refresh</Navbar.Item>
                    <Navbar.Item active={selectedNav === '/about'} onClick={()=>{history.push('/about')}}>About</Navbar.Item>
                </Navbar.Segment>
            </Navbar.Menu>
        </Navbar>
    )

}

export default HeaderContainer