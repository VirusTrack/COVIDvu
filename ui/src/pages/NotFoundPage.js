import React from 'react'

import { Message } from 'rbx'
import ContentLayout from '../layouts/ContentLayout'


import { usePageTitle } from '../hooks/ui'

export const NotFoundPage = () => {
  usePageTitle('Location Not Found')

  return (
    <ContentLayout>
      <Message color="danger" size="medium">
        <Message.Header>
          <h2>404</h2>
        </Message.Header>
        <Message.Body>
          This is not the page you were looking for!
        </Message.Body>
      </Message>
    </ContentLayout>
  )
}
