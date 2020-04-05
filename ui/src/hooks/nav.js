import { useDispatch } from 'react-redux'
import { useHistory, useLocation } from 'react-router'

import { actions } from '../ducks/services'

import queryString from 'query-string'

/**
 * Change page navigation but clear the graph prior
 */
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

/**
 * Handle the history object for the compare graphs pages
 * 
 * @param {*} urlFragment 
 */
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