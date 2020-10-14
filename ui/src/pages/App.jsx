import React from 'react'

import {
    Switch,
    Route,
} from 'react-router-dom'
import DepreciatedPage from './DepreciatedPage'

const App = () => (
    <Switch>
        <Route>
            <DepreciatedPage />
        </Route>
    </Switch>
)

export default App
