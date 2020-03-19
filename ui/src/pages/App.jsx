import React from 'react'

import { DashboardPage } from './DashboardPage'
import { PrivacyPolicyPage } from './PrivacyPolicyPage'
import { CovidGlobalPage } from './CovidGlobalPage'
import { CovidContinentalPage } from './CovidContinentalPage'
import { CovidUSPage } from './CovidUSPage'
import { CovidUSRegionsPage } from './CovidUSRegionsPage'
import { StatsPage } from './StatsPage'
import { AboutPage } from './AboutPage'

import {
    Switch,
    Route,
    Redirect,
} from 'react-router-dom'
import { NotFoundPage } from './NotFoundPage'

const App = () => (
    <Switch>
        <Redirect exact from="/" to="/dashboard" />

        <Route path="/dashboard">
            <DashboardPage />
        </Route>
        <Route path="/covid/us/regions">
            <CovidUSRegionsPage />
        </Route>
        <Route path="/covid/us">
            <CovidUSPage />
        </Route>
        <Route path="/covid/continental">
            <CovidContinentalPage />
        </Route>
        <Route path="/covid">
            <CovidGlobalPage />
        </Route>
        <Route path="/stats">
            <StatsPage />
        </Route>
        <Route path="/about">
            <AboutPage />
        </Route>
        <Route path="/privacy">
            <PrivacyPolicyPage />
        </Route>
        <Route>
            <NotFoundPage />
        </Route>
    </Switch>
)

export default App
