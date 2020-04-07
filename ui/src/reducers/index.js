// @flow

import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import services from '../ducks/services';

export default (history) => combineReducers({
  router: connectRouter(history),
  services,
});
