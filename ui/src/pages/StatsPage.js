import React from 'react'

import { useLocation } from 'react-router'

import ErrorBoundary from '../components/ErrorBoundary'
import StatsContainer from '../containers/StatsContainer'
import MainLayout from '../layouts/MainLayout'

import queryString from 'query-string'

export const StatsPage = () => {

    const { search } = useLocation()

    let query = queryString.parse(search.indexOf('?') === 0 ? search.substr(1) : search)

    return (
        <MainLayout>
            <ErrorBoundary>
                <StatsContainer filter={query.filter} />
            </ErrorBoundary>
        </MainLayout>
    )
}

export default StatsPage