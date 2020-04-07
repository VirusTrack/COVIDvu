import React from 'react'

import { useChangePage } from '../hooks/nav'

import { useHistory, useLocation } from "react-router-dom"

import { Navbar, Button } from "rbx"
import LogoElement from '../components/LogoElement'
import SocialIcons from '../components/SocialIcons'

import NewsletterModalButton from '../components/NewsletterModalButton'

import { useClientCountry } from '../hooks/ui'

import { 
    GOOGLE_ANALYTICS_KEY,
} from '../constants'

import ReactGA from 'react-ga'

import compassImg from '../images/fa-icon-compass.svg'
import globeImg from '../images/fa-icon-globe.svg'
import flagImg from '../images/fa-icon-flag-regular.svg'
import chartImg from '../images/fa-icon-chart.svg'
import infoImg from '../images/fa-icon-info.svg'

export const HeaderContainer = () => {

    const history = useHistory()
    const location = useLocation()
    const clientCountry = useClientCountry()
    const changePage = useChangePage()

    const selectedNav = location.pathname

    ReactGA.initialize(GOOGLE_ANALYTICS_KEY)
    ReactGA.pageview(window.location.pathname + window.location.search)

    const LocalizedNavMenu = () => (
        <Navbar.Item onClick={() => { clientCountry.countryISO === 'US' ? changePage("/covid/us") : changePage(`/covid/country/${clientCountry.country}`)}}><img src={flagImg} alt="Flag Icon"/>{clientCountry.countryISO === 'US' ? "United States" : clientCountry.country}</Navbar.Item>
    )

    return (
        <>
        <div className="meta-nav">
            <NewsletterModalButton buttonCopy="Newsletter Sign Up" size="small" color="primary" style={{fontSize: '1.0rem', lineHeight: '1rem'}} />
            <p>{ false && `Due to problems with one of our data sources, all data on the site at the moment is for yesterday 03/25. Our amazing volunteer team is in the middle of fixing this linkage and
            it will be resolved shortly. Thank you for your patience!`}</p>
            
            <SocialIcons size="small" donate />
        </div>
        
        <Navbar>
            <Navbar.Brand>
                <Navbar.Item onClick={() => { changePage('/dashboard') }}>
                    <LogoElement size="small" />
                </Navbar.Item>
                <Navbar.Burger />
            </Navbar.Brand>
            <Navbar.Menu>
                <Navbar.Segment align="start">
                    <Navbar.Item active={selectedNav === '/dashboard'} onClick={()=>{changePage('/dashboard')}}><img src={compassImg} alt="Compass"/>Dashboard</Navbar.Item>
                    <Navbar.Item active={selectedNav === '/covid'} onClick={()=>{changePage('/covid')}}><img src={globeImg} alt="Globe"/>Global</Navbar.Item>
                    
                    {clientCountry &&
                        <LocalizedNavMenu />
                    }
                    
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
