import React, { useEffect } from 'react'

import { useHistory } from 'react-router'

import queryString from 'query-string'

// export function changePage (pageLocation) {
//     const history = useHistory()

//     if(location.pathname !== pageLocation) {
//         dispatch(actions.clearGraphs())
//         history.push(pageLocation)
//     }
// }


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