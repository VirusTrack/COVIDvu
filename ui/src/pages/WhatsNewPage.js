import React from 'react'

import { Box, Content, Title } from 'rbx'
import moment from 'moment'
import { usePageTitle } from '../hooks/ui'


import ContentLayout from '../layouts/ContentLayout'

const changelog = require('../constants/changelog.json')

export const WhatsNewPage = () => {
  usePageTitle("What's New")

  return (
    <ContentLayout>
      <Box>
        <Content>
          <Title size={2}>What&apos;s New</Title>
          <p>
            For an overview of the new things on this app, review the list below.
          </p>
          {changelog.map((logEntry, idx) => (
            <React.Fragment key={idx}>
              <Title size={4}>{moment(logEntry.date).format('YYYY-MM-DD')}</Title>
              <ul>
                {logEntry.changes.map((change, changeIdx) => (
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
