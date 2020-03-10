import React from 'react'

import { CovidGlobalPage } from './CovidGlobalPage'
import { CovidUSPage } from './CovidUSPage'
import { CovidUSRegionsPage } from './CovidUSRegionsPage'
import { AboutPage } from './AboutPage'

import {
    Switch,
    Route,
    Redirect,
} from 'react-router-dom'
import { NotFoundPage } from './NotFoundPage'

const App = () => (
    <Switch>
        <Redirect exact from="/" to="/covid" />

        <Route path="/covid/us/regions">
            <CovidUSRegionsPage />
        </Route>
        <Route path="/covid/us">
            <CovidUSPage />
        </Route>
        <Route path="/covid">
            <CovidGlobalPage />
        </Route>
        <Route path="/about">
            <AboutPage />
        </Route>
        <Route>
            <NotFoundPage />
        </Route>
    </Switch>
)

export default App
