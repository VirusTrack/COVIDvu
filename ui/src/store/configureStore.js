import { createStore, compose, applyMiddleware } from 'redux'

// eslint-disable-next-line
import reduxImmutableStateInvariant from 'redux-immutable-state-invariant';
import createSagaMiddleware from 'redux-saga'
import { routerMiddleware } from 'connected-react-router'

import rootSaga from '../sagas/rootSaga'
import rootReducer from '../reducers'

const isProd = process.env.NODE_ENV === 'production'

const sagaMiddleware = createSagaMiddleware()

function prod(initialState, history) {
  const router = routerMiddleware(history)

  const middleware = [router, sagaMiddleware]

  const store = createStore(
    rootReducer(history),
    initialState,
    compose(applyMiddleware(...middleware)),
  )

  sagaMiddleware.run(rootSaga)

  return store
}

function dev(initialState, history) {
  const router = routerMiddleware(history)

  const middleware = [
    // Redux middleware that spits an error on you when you try to mutate your
    // state either inside a dispatch or between dispatches.
    reduxImmutableStateInvariant(),
    router,
    sagaMiddleware,
  ]

  // add support for Redux dev tools
  // eslint-disable-next-line no-underscore-dangle
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
  const store = createStore(
    rootReducer(history),
    initialState,
    composeEnhancers(applyMiddleware(...middleware)),
  )

  sagaMiddleware.run(rootSaga)

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    // $FlowFixMe - development boilerplate, no Flow annotations needed
    module.hot.accept('../reducers', () => {
      const nextReducer = require('../reducers').default // eslint-disable-line global-require
      store.replaceReducer(nextReducer)
    })
  }

  return store
}

export default (isProd ? prod : dev)
