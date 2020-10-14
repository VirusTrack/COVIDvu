import React from 'react'

import { DashboardPage } from './DashboardPage'
import { PrivacyPolicyPage } from './PrivacyPolicyPage'
import { CovidGlobalPage } from './CovidGlobalPage'
import { CovidCountryPage } from './CovidCountryPage'
import { CovidContinentalPage } from './CovidContinentalPage'
import { CovidUSPage } from './CovidUSPage'
import { CovidUSRegionsPage } from './CovidUSRegionsPage'
import { CovidRegionPage } from './CovidRegionPage'
import { StatsPage } from './StatsPage'
import { AboutPage } from './AboutPage'
import { PredictionMethodologyPage } from './PredictionMethodologyPage'
import { WhatsNewPage } from './WhatsNewPage'

import {
    Switch,
    Route,
    Redirect,
} from 'react-router-dom'
import { NotFoundPage } from './NotFoundPage'
import DepreciatedPage from './DepreciatedPage'

const App = () => (
    <Switch>
        <Redirect exact from="/" to="/depreciated" />

        <Route path="/dashboard">
            <DashboardPage />
        </Route>
        <Route path="/covid/region/:region">
            <CovidRegionPage />
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
        <Route path="/covid/country/:region">
            <CovidCountryPage />
        </Route>
        <Route path="/covid">
            <CovidGlobalPage />
        </Route>
        <Route path="/stats">
            <StatsPage />
        </Route>
        <Route path="/about/methodology/prediction">
            <PredictionMethodologyPage />
        </Route>
        <Route path="/about">
            <AboutPage />
        </Route>
        <Route path="/privacy">
            <PrivacyPolicyPage />
        </Route>
        <Route path="/whatsnew">
            <WhatsNewPage />
        </Route>
        <Route path="/depreciated">
            <DepreciatedPage />
        </Route>
        <Route>
            <NotFoundPage />
        </Route>
    </Switch>
)

export default App
