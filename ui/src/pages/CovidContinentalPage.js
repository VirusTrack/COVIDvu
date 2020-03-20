import React from 'react'

import { useLocation } from 'react-router'
import queryString from 'query-string'

import ErrorBoundary from '../components/ErrorBoundary'
import ContinentalGraphContainer from '../containers/ContinentalGraphContainer'
import MainLayout from '../layouts/MainLayout'


export const CovidContinentalPage = () => {
    
    const { search } = useLocation()

    const validGraphs = ['Confirmed', 'Deaths', 'Recovered', 'Mortality', 'Recovery']

    let query = queryString.parse(search.indexOf('?') === 0 ? search.substr(1) : search)

    let continent = query.continent ? Array.isArray(query.continent) ? query.continent : [query.continent] : undefined
    let graph = validGraphs.indexOf(query.graph) !== -1 ? query.graph : undefined

    return (
        <MainLayout>
            <ErrorBoundary>
                <ContinentalGraphContainer continent={continent} graph={graph} />
            </ErrorBoundary>
        </MainLayout>
    )
}

export default CovidContinentalPage