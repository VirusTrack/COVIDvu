import React from 'react'

import { Content, Notification, Delete } from "rbx"

import { HeaderContainer } from '../containers/HeaderContainer'
import { FooterContainer } from '../containers/FooterContainer'

export const MainLayout = ({ children }) => {
    const nodes = React.Children.toArray(children);

    return (
        <>
            <HeaderContainer />

            <Content style={{ margin: '0.5rem' }}>

                <Notification color="warning">
                    <Delete as="button" />

                    Our data source only updates once a day, but we'd love help to get data faster. If you'd like to contribute please reach out to us on <a href="https://github.com/pr3d4t0r/covidvu" target="_new">GitHub</a>.
                </Notification>

                {nodes[0]}

            </Content>

            <FooterContainer />
        </>
    )
}

export default MainLayout