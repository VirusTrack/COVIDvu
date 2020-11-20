import React from 'react'

import {
    Switch,
    Route,
} from 'react-router-dom'
import DeprecatedPage from './DeprecatedPage'

const App = () => (
    <Switch>
        <Route>
            <DeprecatedPage />
        </Route>
    </Switch>
)

export default App
