import React, { useEffect } from 'react'

import { useLocation, useHistory } from 'react-router'

export function changePage (pageLocation) {

    if(location.pathname !== pageLocation) {
        dispatch(actions.clearGraphs())
        history.push(pageLocation)
    }
}
