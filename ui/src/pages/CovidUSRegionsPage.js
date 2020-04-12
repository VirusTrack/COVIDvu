import React from 'react'

import { useLocation } from 'react-router'
import queryString from 'query-string'

import ErrorBoundary from '../components/ErrorBoundary'
import MainLayout from '../layouts/MainLayout'
import USRegionsGraphContainer from '../containers/USRegionsGraphContainer'

import { usePageTitle } from '../hooks/ui'
import { GRAPHSCALE_TYPES } from '../constants'

export const CovidUSRegionsPage = () => {
  const { search } = useLocation()

  const validGraphs = ['Cases', 'Deaths', 'Recovered', 'Mortality', 'Recovery']

  const query = queryString.parse(search.indexOf('?') === 0 ? search.substr(1) : search)

  const region = query.region ? Array.isArray(query.region) ? query.region : [query.region] : undefined
  const graph = validGraphs.indexOf(query.graph) !== -1 ? query.graph : undefined
  const graphScale = query.graphScale ? query.graphScale : GRAPHSCALE_TYPES.LINEAR

  usePageTitle('United States Regional Graphs')

  return (
    <MainLayout>
      <ErrorBoundary>
        <USRegionsGraphContainer region={region} graph={graph} graphScaleParam={graphScale} />
      </ErrorBoundary>
    </MainLayout>
  )
}

export default CovidUSRegionsPage
