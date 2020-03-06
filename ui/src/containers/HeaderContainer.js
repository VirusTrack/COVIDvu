import React, { useEffect } from 'react'

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
                        <Button.Group>
                        <Button color="primary" onClick={() => { history.push('/signup') }}>
                            <strong>Sign up</strong>
                        </Button>
                        <Button color="light" onClick={() => { history.push('/login') }}>Log in</Button>
                        </Button.Group>
                    </Navbar.Item>
                </Navbar.Segment>
            </Navbar.Menu>
        </Navbar>
    )

}