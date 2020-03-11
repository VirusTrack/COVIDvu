import React from 'react'

import ErrorBoundary from '../components/ErrorBoundary'
import StatsContainer from '../containers/StatsContainer'
import MainLayout from '../layouts/MainLayout'

export const StatsPage = () => {

    return (
        <MainLayout>
            <ErrorBoundary>
                <StatsContainer />
            </ErrorBoundary>
        </MainLayout>
    )
}

export default StatsPage