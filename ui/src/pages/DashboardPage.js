import React from 'react'

import ErrorBoundary from '../components/ErrorBoundary'
import MainLayout from '../layouts/MainLayout'

import DashboardContainer from '../containers/DashboardContainer'

export const DashboardPage = () => {
 
    return (
        <MainLayout>
            <ErrorBoundary>
                <DashboardContainer />
            </ErrorBoundary>
        </MainLayout>
    )

}

export default DashboardPage