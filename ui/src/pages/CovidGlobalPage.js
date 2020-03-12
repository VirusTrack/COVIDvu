import React from 'react'

import { useLocation } from 'react-router'
import queryString from 'query-string'

import ErrorBoundary from '../components/ErrorBoundary'
import GlobalGraphContainer from '../containers/GlobalGraphContainer'
import MainLayout from '../layouts/MainLayout'


export const CovidGlobalPage = () => {
    
    const { search } = useLocation()

    const validGraphs = ['Confirmed', 'Deaths', 'Recovered', 'Mortality', 'Recovery']

    let query = queryString.parse(search.indexOf('?') === 0 ? search.substr(1) : search)

    let country = query.country ? Array.isArray(query.country) ? query.country : [query.country] : undefined
    let graph = validGraphs.indexOf(query.graph) !== -1 ? query.graph : undefined

    return (
        <MainLayout>
            <ErrorBoundary>
                <GlobalGraphContainer country={country} graph={graph} />
            </ErrorBoundary>
        </MainLayout>
    )
}

export default CovidGlobalPage