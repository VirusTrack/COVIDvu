import React from 'react'

import { useHistory } from "react-router-dom"

import { Navbar, Button } from "rbx"

export const HeaderContainer = ({activeItem}) => {
    const history = useHistory()
    
    return (
        <Navbar>
            <Navbar.Brand>
                <Navbar.Item onClick={() => { history.push('/') }}>
                    COVIDvu
                </Navbar.Item>
                <Navbar.Burger />
            </Navbar.Brand>
            <Navbar.Menu>
                <Navbar.Segment align="end">
                    <Navbar.Item>
                        <Button color="primary">
                            <strong>Reload</strong>
                        </Button>
                    </Navbar.Item>
                </Navbar.Segment>
            </Navbar.Menu>
        </Navbar>
    )

}