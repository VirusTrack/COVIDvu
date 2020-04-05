import React from 'react'

import { Box, Button, Content, Title, Notification, Level, Select } from 'rbx'

import ContentLayout from '../layouts/ContentLayout'

import { usePageTitle } from '../hooks/ui'

import { ENABLE_PREDICTIONS, CLIENT_COUNTRY_KEY, CLIENT_COUNTRY_CODE_KEY } from '../constants'

import store from 'store2'

const isoCountries = require('../constants/iso-countries.json');

export const AboutPage = () => {

    usePageTitle("About the Project")

    return (
        
            <ContentLayout>
                <Box>
                <Content>
                    <Title size={2}>About The Project</Title>

                    <Notification color="info">
                        Check out our <a href="/whatsnew">What's New</a> page for more details on the latest features on the site.
                    </Notification>

                    <p>
                    Volunteers building and sharing current, accurate, near real-time COVID-19 tracking and prediction tools.
                    </p>

                    { ENABLE_PREDICTIONS &&
                        <>
                            <Title size={4}>Methodology</Title>
                            <p>
                                Check out <a href="/about/methodology/prediction">how we model predictions</a> and how we arrived at the numbers seen after clicking "Show Predictions".
                            </p>
                        </>
                    }
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

                    <Title size={4}>Debug</Title>
                    <Level>
                    <Level.Item align="left">
                            <Button onClick={() => { store.remove(CLIENT_COUNTRY_KEY); store.remove(CLIENT_COUNTRY_CODE_KEY) }}>Clear country cache</Button>
                        </Level.Item>
                    </Level>
                    <Level>
                        <Level.Item align="left">
                            Change Country:&nbsp;
                            <Select.Container>
                                <Select defaultValue={store.get(CLIENT_COUNTRY_KEY)}>
                                    {Object.keys(isoCountries).map(countryCode => (
                                        <Select.Option onClick={() => {
                                            store.set(CLIENT_COUNTRY_KEY, isoCountries[countryCode]);
                                            store.set(CLIENT_COUNTRY_CODE_KEY, countryCode)
                                        }} key={countryCode}>{isoCountries[countryCode]}</Select.Option>
                                    ))}
                                </Select>
                            </Select.Container>
                        </Level.Item>
                    </Level>

                </Content>
                </Box>
            </ContentLayout>
        
    )
}

export default AboutPage