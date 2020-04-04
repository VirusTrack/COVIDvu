import React from 'react'

import { useLocation } from 'react-router'
import queryString from 'query-string'
import { useParams } from 'react-router'

import ErrorBoundary from '../components/ErrorBoundary'
import RegionGraphContainer from '../containers/RegionGraphContainer'
import MainLayout from '../layouts/MainLayout'

import { usePageTitle } from '../hooks/ui'

export const CovidRegionPage = () => {
    let { region } = useParams()
    const { search } = useLocation()

    let query = queryString.parse(search.indexOf('?') === 0 ? search.substr(1) : search)

    const validGraphs = ['Cases', 'Deaths', 'Recovered', 'Mortality', 'Recovery']

    let uniqueRegion = query.region ? Array.isArray(query.region) ? query.region : [query.region] : undefined
    let graph = validGraphs.indexOf(query.graph) !== -1 ? query.graph : undefined
    let showLog = query.showLog === 'true' ? true : false

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