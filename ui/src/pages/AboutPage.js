import React from 'react'

import { Message } from 'rbx'

import ContentLayout from '../layouts/ContentLayout'

export const AboutPage = () => {

    return (
        <ContentLayout>
            <Message color='info' size='medium'>
                <Message.Header>
                    <h2>About Us</h2>
                </Message.Header>
                <Message.Body>
                    <p>
                        More links coming soon. For now you can look us up on <a href="https://github.com/pr3d4t0r/covidvu" target="_new">GitHub</a>.                        
                    </p>
                    <br />
                    <p>
                        <a href="https://t.me/covidvudev" target="_new">Join us on Telegram.</a>
                    </p>
                </Message.Body>
            </Message>
        </ContentLayout>
    )
}

export default AboutPage