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

                {nodes[0]}

            </Content>

            <FooterContainer />
        </>
    )
}

export default MainLayout