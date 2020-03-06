import React from 'react'

import { HeaderContainer } from '../containers/HeaderContainer'

import { Message, Section, Column } from 'rbx'

export const NotFoundPage = () => {

    return (
        <div className="404-panel">
            <HeaderContainer />

            <Section>
                <Column.Group centered={true}>
                    <Column size="half">
                        <Message color={'danger'} size='medium'>
                            <Message.Header>
                                <h2>404</h2>
                            </Message.Header>
                            <Message.Body>
                                This is not the page you were looking for!
                            </Message.Body>
                        </Message>
                    </Column>
                </Column.Group>
            </Section>
        </div>
    )
}