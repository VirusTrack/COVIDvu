import React from 'react'

import { useHistory, useLocation } from "react-router-dom"

import { Navbar, Title } from "rbx"

import VirusTrackLogo from '../images/virus-pngrepo-icon.png'

export const HeaderContainer = () => {
    const history = useHistory()
    const location = useLocation()

    const selectedNav = location.pathname
    
    return (
        <Navbar color="dark">
            <Navbar.Brand>
                <Navbar.Item onClick={() => { history.push('/') }}>
                    <img src={VirusTrackLogo} alt="" role="presentation" />&nbsp;
                    <Title style={{color: 'white'}} size={5}>Coronavirus COVID-19 Cases</Title>
                </Navbar.Item>
                <Navbar.Burger />
            </Navbar.Brand>
            <Navbar.Menu>
                <Navbar.Segment align="start">
                    <Navbar.Item active={selectedNav === '/covid'} onClick={()=>{history.push('/covid')}}>Global</Navbar.Item>
                    <Navbar.Item active={selectedNav === '/covid/us'} onClick={() => {history.push('/covid/us')}}>US States</Navbar.Item>
                    <Navbar.Item active={selectedNav === '/covid/us/regions'} onClick={()=>{history.push('/covid/us/regions')}}>US Regions</Navbar.Item>
                </Navbar.Segment>

                <Navbar.Segment align="end">
                    <Navbar.Item active={selectedNav === '/about'} onClick={()=>{history.push('/about')}}>About</Navbar.Item>
                </Navbar.Segment>
            </Navbar.Menu>
        </Navbar>
    )

}