import React from 'react'

import { HeaderContainer } from '../containers/HeaderContainer'

import { Message, Section, Column } from 'rbx'

export const AboutPage = () => {

    return (
        <div className="404-panel">
            <HeaderContainer />

            <Section>
                <Column.Group centered={true}>
                    <Column size="half">
                        <Message color='info' size='medium'>
                            <Message.Header>
                                <h2>About Us</h2>
                            </Message.Header>
                            <Message.Body>
                                More links coming soon. For now you can look us up on <a href="https://github.com/pr3d4t0r/covidvu" target="_new">GitHub</a>.
                            </Message.Body>
                        </Message>
                    </Column>
                </Column.Group>
            </Section>
        </div>
    )
}

export default AboutPage