import React from 'react'

import { useLocation, useParams } from 'react-router'
import queryString from 'query-string'

import ErrorBoundary from '../components/ErrorBoundary'
import CountryGraphContainer from '../containers/CountryGraphContainer'
import MainLayout from '../layouts/MainLayout'

import { usePageTitle } from '../hooks/ui'
import { GRAPHSCALE_TYPES } from '../constants'

export const CovidCountryPage = () => {
  const { region } = useParams()
  const { search } = useLocation()

  const validGraphs = ['Cases', 'Deaths', 'Recovered', 'Mortality', 'Recovery']

  const query = queryString.parse(search.indexOf('?') === 0 ? search.substr(1) : search)

  const graph = validGraphs.indexOf(query.graph) !== -1 ? query.graph : undefined
  const graphScale = query.graphScale ? query.graphScale : GRAPHSCALE_TYPES.LINEAR
  const showPredictions = query.showPredictions === 'true'

  usePageTitle(`${region} Graphs`)

  return (
    <MainLayout>
      <ErrorBoundary>
        <CountryGraphContainer region={region} graph={graph} graphScaleParam={graphScale} showPredictionsParam={showPredictions} />
      </ErrorBoundary>
    </MainLayout>
  )
}

export default CovidCountryPage
