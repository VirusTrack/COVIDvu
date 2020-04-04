import React from 'react'

import { useLocation } from 'react-router'
import queryString from 'query-string'

import ErrorBoundary from '../components/ErrorBoundary'
import MainLayout from '../layouts/MainLayout'
import USRegionsGraphContainer from '../containers/USRegionsGraphContainer'

import { usePageTitle } from '../hooks/ui'

export const CovidUSRegionsPage = () => {

    const { search } = useLocation()

    const validGraphs = ['Cases', 'Deaths', 'Recovered', 'Mortality', 'Recovery']

    let query = queryString.parse(search.indexOf('?') === 0 ? search.substr(1) : search)

    let region = query.region ? Array.isArray(query.region) ? query.region : [query.region] : undefined
    let graph = validGraphs.indexOf(query.graph) !== -1 ? query.graph : undefined
    let showLog = query.showLog === 'true' ? true : false

    usePageTitle("United States Regional Graphs")

    return (
        <MainLayout>
            <ErrorBoundary>
                <USRegionsGraphContainer region={region} graph={graph} showLogParam={showLog} />
            </ErrorBoundary>
        </MainLayout>
    )
}

export default CovidUSRegionsPage