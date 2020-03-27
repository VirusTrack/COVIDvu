import React, { useEffect } from 'react'

import ContentLayout from '../layouts/ContentLayout'

import { Message } from 'rbx'

import { DEFAULT_DOCUMENT_TITLE } from '../constants'

export const NotFoundPage = () => {

    useEffect(() => {
        document.title = `Location Not Found | ${DEFAULT_DOCUMENT_TITLE}`        
    }, [])

    return (
        <ContentLayout>
            <Message color={'danger'} size='medium'>
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