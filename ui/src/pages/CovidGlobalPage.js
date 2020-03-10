import React, { useEffect, useState, useMemo } from 'react'

import ErrorBoundary from '../components/ErrorBoundary'
import GlobalGraphContainer from '../containers/GlobalGraphContainer'
import MainLayout from '../layouts/MainLayout'

export const CovidGlobalPage = () => {

    return (
        <MainLayout>
            <ErrorBoundary>
                <GlobalGraphContainer />
            </ErrorBoundary>
        </MainLayout>
    )
}

export default CovidGlobalPage