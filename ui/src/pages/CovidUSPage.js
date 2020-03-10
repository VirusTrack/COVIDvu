import React from 'react'

import ErrorBoundary from '../components/ErrorBoundary'
import USGraphContainer from '../containers/USGraphContainer'
import MainLayout from '../layouts/MainLayout'

export const CovidUSPage = () => {

    return (
        <MainLayout>
            <ErrorBoundary>
                <USGraphContainer />
            </ErrorBoundary>
        </MainLayout>
    )
}

export default CovidUSPage