import React from 'react'

import { useLocation } from 'react-router'
import queryString from 'query-string'

import ErrorBoundary from '../components/ErrorBoundary'
import USGraphContainer from '../containers/USGraphContainer'
import MainLayout from '../layouts/MainLayout'

import { usePageTitle } from '../hooks/ui'

export const CovidUSPage = () => {
  const { search } = useLocation()

  const validGraphs = ['Cases', 'Deaths', 'Recovered', 'Mortality', 'Recovery']

  const query = queryString.parse(search.indexOf('?') === 0 ? search.substr(1) : search)

  const region = query.region ? Array.isArray(query.region) ? query.region : [query.region] : undefined
  const graph = validGraphs.indexOf(query.graph) !== -1 ? query.graph : undefined
  const showLog = query.showLog === 'true'
  const showPredictions = query.showPredictions === 'true'

  usePageTitle('United States Graphs')

  return (
    <MainLayout>
      <ErrorBoundary>
        <USGraphContainer region={region} graph={graph} showLogParam={showLog} showPredictionsParam={showPredictions} />
      </ErrorBoundary>
    </MainLayout>
  )
}

export default CovidUSPage
