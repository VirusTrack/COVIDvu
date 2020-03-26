import React, { useEffect } from 'react'

import { useLocation } from 'react-router'
import queryString from 'query-string'

import ErrorBoundary from '../components/ErrorBoundary'
import MainLayout from '../layouts/MainLayout'

import DashboardContainer from '../containers/DashboardContainer'

import { DEFAULT_DOCUMENT_TITLE } from '../constants'

export const DashboardPage = () => {
 
    const { search } = useLocation()

    let query = queryString.parse(search.indexOf('?') === 0 ? search.substr(1) : search)

    let showLog = query.showLog === 'true' ? true : false

    useEffect(() => {
        document.title = `Dashboard | ${DEFAULT_DOCUMENT_TITLE}`        
    }, [])
    
    return (
        <MainLayout>
            <ErrorBoundary>
                <DashboardContainer showLogParam={showLog} />
            </ErrorBoundary>
        </MainLayout>
    )

}

export default DashboardPage