import React from 'react'

import { Section, Column } from "rbx"

import { HeaderContainer } from '../containers/HeaderContainer'
import { FooterContainer } from '../containers/FooterContainer'

export const ContentLayout = ({ children }) => {
    const nodes = React.Children.toArray(children);

    return (
        <>
            <HeaderContainer />

            <Section>
                <Column.Group centered={true}>
                    <Column size="half">
                        {nodes[0]}
                    </Column>
                </Column.Group>
            </Section>

            <FooterContainer />
        </>
    )
}

export default ContentLayout