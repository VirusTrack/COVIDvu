import React from 'react'

import { useLocation, useParams } from 'react-router'
import queryString from 'query-string'

import ErrorBoundary from '../components/ErrorBoundary'
import CountryGraphContainer from '../containers/CountryGraphContainer'
import MainLayout from '../layouts/MainLayout'

import { usePageTitle } from '../hooks/ui'

export const CovidCountryPage = () => {
    
    let { region } = useParams()
    const { search } = useLocation()

    const validGraphs = ['Cases', 'Deaths', 'Recovered', 'Mortality', 'Recovery']

    let query = queryString.parse(search.indexOf('?') === 0 ? search.substr(1) : search)

    let graph = validGraphs.indexOf(query.graph) !== -1 ? query.graph : undefined
    let showLog = query.showLog === 'true' ? true : false
    let showPredictions = query.showPredictions === 'true' ? true : false

    usePageTitle(`${region} Graphs`)

    return (
        <MainLayout>
            <ErrorBoundary>
                <CountryGraphContainer region={region} graph={graph} showLogParam={showLog} showPredictionsParam={showPredictions} />
            </ErrorBoundary>
        </MainLayout>
    )
}

export default CovidCountryPage