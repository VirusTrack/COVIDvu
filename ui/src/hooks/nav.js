import React, { useEffect } from 'react'

import { useDispatch } from 'react-redux'

import { useHistory, useLocation } from 'react-router'

import { actions } from '../ducks/services'

import queryString from 'query-string'

export function useChangePage() {
    const history = useHistory()
    const dispatch = useDispatch()
    const location = useLocation()

    return (pageLocation) => {
        if(location.pathname !== pageLocation) {
            dispatch(actions.clearGraphs())
            history.push(pageLocation)
        }    
    }
}

export function useHandleHistory(urlFragment) {
    const history = useHistory()

    return (region, graph, showLog, showPredictions) => {

        const query = queryString.stringify({
            region,
            graph,
            showLog,
            showPredictions
        })

        history.replace(`${urlFragment}?${query}`)
    }
}