import React from 'react'

import { HomePage } from './HomePage'

import {
    Switch,
    Route,
    Redirect,
} from 'react-router-dom'
import { NotFoundPage } from './NotFoundPage'

// const PrivateRoute = ({ children, ...rest }) => {
//     return (
//         <Route
//             {...rest}
//             render={({ location }) => localStorage.getItem('AUTHORIZATION_KEY') ? (
//                 children
//             ) : (
//                 <Redirect
//                     to={{
//                         pathname: "/login",
//                         state: { from: location }
//                     }}
//                 />
//             )
//         }
//         />
//     )
// }

const App = () => (
    <Switch>
        <Redirect exact from="/" to="/home" />

        <Route path="/home">
            <HomePage />
        </Route>
        <Route>
            <NotFoundPage />
        </Route>
    </Switch>
)

export default App
