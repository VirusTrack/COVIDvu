import { all } from 'redux-saga/effects'

import { sagas as servicesSagas } from '../ducks/services'

export default function* rootSaga() {
    yield all([
        ...servicesSagas,
    ])
}
