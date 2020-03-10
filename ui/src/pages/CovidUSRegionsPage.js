import React from 'react'

import ErrorBoundary from '../components/ErrorBoundary'
import MainLayout from '../layouts/MainLayout'
import USRegionsGraphContainer from '../containers/USRegionsGraphContainer'

export const CovidUSRegionsPage = () => {

    return (
        <MainLayout>
            <ErrorBoundary>
                <USRegionsGraphContainer />
            </ErrorBoundary>
        </MainLayout>
    )
}

export default CovidUSRegionsPage