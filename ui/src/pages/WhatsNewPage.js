import React, { useEffect } from 'react'

import { Box, Content, Title } from 'rbx'

import ContentLayout from '../layouts/ContentLayout'

import { DEFAULT_DOCUMENT_TITLE } from '../constants'

import moment from 'moment'

const changelog = require('../constants/changelog.json')

export const WhatsNewPage = () => {

    useEffect(() => {
        document.title = `What's New | ${DEFAULT_DOCUMENT_TITLE}`        
    }, [])
    
    return (
        
            <ContentLayout>
                <Box>
                <Content>
                    <Title size={2}>What's New</Title>
                    <p>
                        For an overview of the new things on this app, review the list below.
                    </p>
                    {changelog.map((logEntry, idx) => (
                        <React.Fragment key={idx}>
                        <Title size={4}>{moment(logEntry['date']).format("YYYY-MM-DD")}</Title>                    
                        <ul>
                        {logEntry['changes'].map((change, changeIdx) => (
                            <li key={changeIdx}>{change}</li>
                        ))}
                        </ul>
                        </React.Fragment>
                    ))}

                </Content>
                </Box>
            </ContentLayout>
        
    )
}

export default WhatsNewPage