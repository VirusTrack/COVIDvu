import React from 'react'

import { useHistory, useLocation } from "react-router-dom"
import { useDispatch } from 'react-redux'

import { actions } from '../ducks/services'

import { Navbar, Notification, Button } from "rbx"
import LogoElement from '../components/LogoElement'

import store from 'store2'

import { 
    GOOGLE_ANALYTICS_KEY,
    LAST_UPDATE_KEY, 
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

    ReactGA.initialize(GOOGLE_ANALYTICS_KEY)
    ReactGA.pageview(window.location.pathname + window.location.search)

    const forceRefresh = () => {
        store.session.remove(LAST_UPDATE_KEY)
    
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
            history.push(pageLocation)
        }
    }

    return (
        <>
        { false &&
            <Notification color="warning" style={{marginBottom: '0'}}>
                Due to problems with one of our data sources, all data on the site at the moment is for yesterday 03/25. Our amazing volunteer team is in the middle of fixing this linkage and
                it will be resolved shortly. Thank you for your patience!
            </Notification>
        }
        <Navbar>
            <Navbar.Brand>
                <Navbar.Item onClick={() => { changePage('/dashboard') }}>
                    <LogoElement size="small" />
                </Navbar.Item>
                <Navbar.Burger />
            </Navbar.Brand>
            <Navbar.Menu>
                <Navbar.Segment align="start">
                    <Navbar.Item active={selectedNav === '/dashboard'} onClick={()=>{changePage('/dashboard')}}><img src={compassImg} alt=""/>Dashboard</Navbar.Item>
                    
                    <Navbar.Item hoverable dropdown>
                        <Navbar.Link arrowless 
                            onClick={()=>{changePage('/covid')}}
                            active={(selectedNav === '/covid' || selectedNav === '/covid/continental').toString()}>
                                <img src={globeImg} alt=""/>Global
                        </Navbar.Link>
                        <Navbar.Dropdown boxed>
                            <Navbar.Item active={selectedNav === '/covid'} onClick={()=>{changePage('/covid')}}>Countries</Navbar.Item>
                            <Navbar.Item active={selectedNav === '/covid/continental'} onClick={()=>{changePage('/covid/continental')}}>Continental</Navbar.Item>
                            <Navbar.Item active={selectedNav === '/covid/region/Europe'} onClick={()=>{changePage('/covid/region/Europe')}}>Europe</Navbar.Item>
                            <Navbar.Item active={selectedNav === '/covid/region/Asia'} onClick={()=>{changePage('/covid/region/Asia')}}>Asia</Navbar.Item>
                            <Navbar.Item active={selectedNav === '/covid/region/Africa'} onClick={()=>{changePage('/covid/region/Africa')}}>Africa</Navbar.Item>
                            <Navbar.Item active={selectedNav === '/covid/region/South America'} onClick={()=>{changePage('/covid/region/South America')}}>South America</Navbar.Item>
                            <Navbar.Item active={selectedNav === '/covid/region/North America'} onClick={()=>{changePage('/covid/region/North America')}}>North America</Navbar.Item>
                            <Navbar.Item active={selectedNav === '/covid/region/Central America'} onClick={()=>{changePage('/covid/region/Central America')}}>Central America</Navbar.Item>
                            <Navbar.Item active={selectedNav === '/covid/region/Oceania'} onClick={()=>{changePage('/covid/region/Oceania')}}>Oceania</Navbar.Item>
                        </Navbar.Dropdown>
                    </Navbar.Item>

                    <Navbar.Item hoverable dropdown>
                        <Navbar.Link arrowless onClick={() => { changePage('/covid/us')}}><img src={usflagImg} alt="United States Flag"/>United States</Navbar.Link>
                        <Navbar.Dropdown boxed>
                            <Navbar.Item active={selectedNav === '/covid/us'} onClick={() => {changePage('/covid/us')}}>US States</Navbar.Item>
                            <Navbar.Item active={selectedNav === '/covid/us/regions'} onClick={()=>{changePage('/covid/us/regions')}}>US Regions</Navbar.Item>
                        </Navbar.Dropdown>
                    </Navbar.Item>
                    
                    <Navbar.Item active={selectedNav === '/stats'} onClick={()=>{changePage('/stats')}}><img src={chartImg} alt=""/>Stats</Navbar.Item>
                </Navbar.Segment>

                <Navbar.Segment align="end">
                    <Navbar.Item color="info">
                        <Button size="medium" color="info" active={(selectedNav === '/whatsnew').toString()} onClick={() => { history.push('/whatsnew') }}>
                            <strong>What's New</strong>
                        </Button>
                    </Navbar.Item>
                    <Navbar.Item active={selectedNav === '/about'} onClick={()=>{history.push('/about')}}><img src={infoImg} alt="About Site"/>About</Navbar.Item>
                </Navbar.Segment>
            </Navbar.Menu>
        </Navbar>
        </>
    )

}

export default HeaderContainer
