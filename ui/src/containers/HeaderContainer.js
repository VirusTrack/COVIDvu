import React, { useEffect } from 'react'

import { Navbar } from 'rbx'
import ReactGA from 'react-ga'

import { useChangePage } from '../hooks/nav'
import LogoElement from '../components/LogoElement'

export const HeaderContainer = () => {
  const changePage = useChangePage()

  useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search)  
  }, [])

  return (
    <>
      <Navbar>
        <Navbar.Brand>
          <Navbar.Item onClick={() => { changePage('/dashboard') }}>
            <LogoElement size="small" />
          </Navbar.Item>
          <Navbar.Burger />
        </Navbar.Brand>
        <Navbar.Menu>
          
        </Navbar.Menu>
      </Navbar>
    </>
  )
}

export default HeaderContainer