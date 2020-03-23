import React from 'react';
import ReactDOM from 'react-dom';

import './index.sass';

import { Provider } from 'react-redux'
import { createBrowserHistory } from 'history'
import { ConnectedRouter } from 'connected-react-router'

import configureStore from './store/configureStore'
import App from './pages/App'

// import * as serviceWorker from './serviceWorker';



const history = createBrowserHistory()
const store = configureStore({}, history)
const root = document.getElementById('root')

if (root instanceof Element) {
  ReactDOM.render(
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <App />
        </ConnectedRouter>
        </Provider>,
    root,
  )
}

