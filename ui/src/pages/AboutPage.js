import React, { useEffect } from 'react'

import { Box, Content, Title } from 'rbx'

import ContentLayout from '../layouts/ContentLayout'

import { DEFAULT_DOCUMENT_TITLE } from '../constants'

export const AboutPage = () => {

    useEffect(() => {
        document.title = `About the Project | ${DEFAULT_DOCUMENT_TITLE}`        
    }, [])
    

    return (
        
            <ContentLayout>
                <Box>
                <Content>
                    <Title size={2}>About The Project</Title>
                    <p>
                    Volunteers building and sharing current, accurate, near real-time COVID-19 tracking and prediction tools.
                    </p>
                    <Title size={4}>How can you help?</Title>
                    <p>
                        If you are a backend developer we need your help with getting at more data so we can fill the graphs on the frontend. Frontend 
                        developers who have experience with React, we need people to help build out more features that will be useful to visitors
                        to the website.
                    </p>
                    <p>
                        Everyone, we need help to test the site, provide suggestions and post issues to <a href="https://github.com/VirusTrack/covidvu/issues" target="_new" rel="noopener noreferrer">GitHub</a>.
                    </p>

                    <Title size={4}>Helpful Links</Title>
                    <ul>
                        <li><a href="https://github.com/VirusTrack/COVIDvu/wiki/FAQ" target="_new" rel="noopener noreferrer">The FAQ</a></li>
                        <li><a href="https://github.com/VirusTrack/covidvu" target="_new" rel="noopener noreferrer">On GitHub</a></li>
                        <li><a href="https://twitter.com/covidvu" target="_new" rel="noopener noreferrer">On Twitter @covidvu</a></li>
                        <li><a href="https://join.slack.com/t/covidvu/shared_invite/zt-cwdj01xj-AsW7PuCJMo7yoqmrBGuiGA" target="_new" rel="noopener noreferrer">On Slack</a></li>
                    </ul>

                    <Title size={4}>What else</Title>
                    <p>
                        Stay inside. Together (but 6 feet or more away) we can help flatten the curve. We're hoping that this website can help folks get
                        a good idea about why this is important, and the state of their country. These are tools that we hope you'll share with others. If you
                        can donate, please do so.
                    </p>

                </Content>
                </Box>
            </ContentLayout>
        
    )
}

export default AboutPage