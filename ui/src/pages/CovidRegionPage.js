import React from 'react'

import { useLocation, useParams } from 'react-router'
import queryString from 'query-string'

import ErrorBoundary from '../components/ErrorBoundary'
import RegionGraphContainer from '../containers/RegionGraphContainer'
import MainLayout from '../layouts/MainLayout'

import { usePageTitle } from '../hooks/ui'

export const CovidRegionPage = () => {
  const { region } = useParams()
  const { search } = useLocation()

  const query = queryString.parse(search.indexOf('?') === 0 ? search.substr(1) : search)

  const validGraphs = ['Cases', 'Deaths', 'Recovered', 'Mortality', 'Recovery']

  const uniqueRegion = query.region ? Array.isArray(query.region) ? query.region : [query.region] : undefined
  const graph = validGraphs.indexOf(query.graph) !== -1 ? query.graph : undefined
  const showLog = query.showLog === 'true'

  usePageTitle(`${region} Graphs`)

  return (
    <MainLayout>
      <ErrorBoundary>
        <RegionGraphContainer
          region={region}
          uniqueRegion={uniqueRegion}
          graph={graph}
          showLogParam={showLog}
        />
      </ErrorBoundary>
    </MainLayout>
  )
}

export default CovidRegionPage
