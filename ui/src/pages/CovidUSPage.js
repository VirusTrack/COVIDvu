import React, { useEffect } from 'react'

import { useLocation } from 'react-router'
import queryString from 'query-string'

import ErrorBoundary from '../components/ErrorBoundary'
import USGraphContainer from '../containers/USGraphContainer'
import MainLayout from '../layouts/MainLayout'

import { DEFAULT_DOCUMENT_TITLE } from '../constants'

export const CovidUSPage = () => {

    const { search } = useLocation()

    const validGraphs = ['Cases', 'Deaths', 'Recovered', 'Mortality', 'Recovery']

    let query = queryString.parse(search.indexOf('?') === 0 ? search.substr(1) : search)

    let region = query.region ? Array.isArray(query.region) ? query.region : [query.region] : undefined
    let graph = validGraphs.indexOf(query.graph) !== -1 ? query.graph : undefined
    let showLog = query.showLog === 'true' ? true : false
    let showPredictions = query.showPredictions === 'true' ? true : false

    useEffect(() => {
        document.title = `United States Graphs | ${DEFAULT_DOCUMENT_TITLE}`        
    }, [])
    

    return (
        <MainLayout>
            <ErrorBoundary>
                <USGraphContainer region={region} graph={graph} showLogParam={showLog} showPredictionsParam={showPredictions} />
            </ErrorBoundary>
        </MainLayout>
    )
}

export default CovidUSPage