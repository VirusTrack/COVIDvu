import React from 'react';
import ReactDOM from 'react-dom';

import { BrowserRouter } from 'react-router-dom'

import { createBrowserHistory } from 'history'

import './index.css';
import App from './pages/App'
import * as serviceWorker from './serviceWorker';

import "rbx/index.css"

const history = createBrowserHistory()
const root = document.getElementById('root')

ReactDOM.render((
    <BrowserRouter history={history}>
      <App />
    </BrowserRouter>
  ), document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
