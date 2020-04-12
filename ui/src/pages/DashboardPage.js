import React from 'react'

import { useLocation } from 'react-router'
import queryString from 'query-string'

import ErrorBoundary from '../components/ErrorBoundary'
import MainLayout from '../layouts/MainLayout'

import DashboardContainer from '../containers/DashboardContainer'

import { usePageTitle } from '../hooks/ui'
import { GRAPHSCALE_TYPES } from '../constants'

export const DashboardPage = () => {
  const { search } = useLocation()

  const query = queryString.parse(search.indexOf('?') === 0 ? search.substr(1) : search)

  const graphScale = query.graphScale ? query.graphScale : GRAPHSCALE_TYPES.LINEAR

  usePageTitle('Dashboard')

  return (
    <MainLayout className="dashboard">
      <ErrorBoundary>
        <DashboardContainer graphScaleParam={graphScale} />
      </ErrorBoundary>
    </MainLayout>
  )
}

export default DashboardPage
