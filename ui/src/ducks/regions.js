import {call, put, takeEvery} from "redux-saga/effects"

import DataService from '../services'

import { createAction } from '@reduxjs/toolkit'

import { groupByKey } from '../utils'

///////////////////////////////////////////////////////////////////////////////
// Action Types
///////////////////////////////////////////////////////////////////////////////

export const types = {
    FETCH_GLOBAL: 'FETCH_GLOBAL',
    FETCH_GLOBAL_SUCCESS: 'FETCH_GLOBAL_SUCCESS',
    FETCH_GLOBAL_ERROR: 'FETCH_GLOBAL_ERROR',

    FETCH_GLOBAL_PREDICTIONS: 'FETCH_GLOBAL_PREDICTIONS',
    FETCH_GLOBAL_PREDICTIONS_SUCCESS: 'FETCH_GLOBAL_PREDICTIONS_SUCCESS',
    FETCH_GLOBAL_PREDICTIONS_ERROR: 'FETCH_GLOBAL_PREDICTIONS_ERROR',

    FETCH_US_PREDICTIONS: 'FETCH_US_PREDICTIONS',
    FETCH_US_PREDICTIONS_SUCCESS: 'FETCH_US_PREDICTIONS_SUCCESS',
    FETCH_US_PREDICTIONS_ERROR: 'FETCH_US_PREDICTIONS_ERROR',

    FETCH_CONTINENTAL: 'FETCH_CONTINENTAL',
    FETCH_CONTINENTAL_SUCCESS: 'FETCH_CONTINENTAL_SUCCESS',
    FETCH_CONTINENTAL_ERROR: 'FETCH_CONTINENTAL_ERROR',

    FETCH_US_STATES: 'FETCH_US_STATES',
    FETCH_US_STATES_SUCCESS: 'FETCH_US_STATES_SUCCESS',
    FETCH_US_STATES_ERROR: 'FETCH_US_STATES_ERROR',

    FETCH_US_REGIONS: 'FETCH_US_REGIONS',
    FETCH_US_REGIONS_SUCCESS: 'FETCH_US_REGIONS_SUCCESS',
    FETCH_US_REGIONS_ERROR: 'FETCH_US_REGIONS_ERROR',
}

///////////////////////////////////////////////////////////////////////////////
// Action Creators
///////////////////////////////////////////////////////////////////////////////

export const actions = {
    fetchGlobal: createAction(types.FETCH_GLOBAL),
    fetchGlobalPredictions: createAction(types.FETCH_GLOBAL_PREDICTIONS),
    fetchUSPredictions: createAction(types.FETCH_US_PREDICTIONS),

    fetchContinental: createAction(types.FETCH_CONTINENTAL),

    fetchUSStates: createAction(types.FETCH_US_STATES),
    fetchUSRegions: createAction(types.FETCH_US_REGIONS),
}

///////////////////////////////////////////////////////////////////////////////
// Reducers
///////////////////////////////////////////////////////////////////////////////

export const initialState = {
    global: undefined,
    globalPredictions: {},
    usPredictions: {},
    continental: {},
    usStates: {},
    usRegions: {},
}

export default function (state = initialState, action) {
    switch (action.type) {
        case types.FETCH_GLOBAL_SUCCESS:
            return {
                ...state,
                global: { 
                    confirmed: action.confirmed,
                    sortedConfirmed: action.sortedConfirmed,
                    statsTotals: action.statsTotals,
                    deaths: action.deaths,
                    mortality: action.mortality,
                },
            }
        case types.FETCH_GLOBAL_PREDICTIONS_SUCCESS:
            return {
                ...state,
                globalPredictions: action.payload,
                graphCleared: null,
            }
        case types.FETCH_US_PREDICTIONS_SUCCESS:
            return {
                ...state,
                usPredictions: action.payload
            }
        case types.FETCH_CONTINENTAL_SUCCESS:
            return {
                ...state,
                continental: { 
                    confirmed: action.confirmed,
                    sortedConfirmed: action.sortedConfirmed,
                    statsTotals: action.statsTotals,
                    deaths: action.deaths,
                    mortality: action.mortality,
                }
            }
        case types.FETCH_US_STATES_SUCCESS:
            return {
                ...state,
                usStates: { 
                    confirmed: action.confirmed,
                    sortedConfirmed: action.sortedConfirmed,
                    statsTotals: action.statsTotals,
                    deaths: action.deaths,
                    mortality: action.mortality,
                    allCounties: action.allCounties,
                    hospitalBeds: action.hospitalBeds,
                }
            }
        case types.FETCH_US_REGIONS_SUCCESS:
            return {
                ...state,
                usRegions: { 
                    confirmed: action.confirmed,
                    sortedConfirmed: action.sortedConfirmed,
                    deaths: action.deaths,
                    mortality: action.mortality,
                }
            }
        default:
            return state
    }
}

const calculateMortality = (deaths, confirmed) => {
    let mortality = {}

    if(deaths !== null && confirmed !== null) {
    
        for(const region of Object.keys(deaths)) {
            for(const date of Object.keys(deaths[region])) {
                let deathAtDate = deaths[region][date]

                if(!confirmed.hasOwnProperty(region)) {
                    continue
                }
                let confirmedAtDate = confirmed[region][date]

                if(!mortality.hasOwnProperty(region)) {
                    mortality[region] = {}
                }
                mortality[region][date] = (deathAtDate / confirmedAtDate)
            }
        }
    }

    return { mortality }
}

///////////////////////////////////////////////////////////////////////////////
// Sagas
///////////////////////////////////////////////////////////////////////////////

const filterCountries = [
    '!Outside China', 
]

export function* fetchGlobalPredictions({payload}) {
    console.time('fetchGlobalPredictions')

    const dataService = new DataService()

    try {
        console.time('fetchGlobalPredictions.axios')

        const globalPredictions = yield call(dataService.getGlobalPredictions)

        console.timeEnd('fetchGlobalPredictions.axios')
        
        yield put(
            { 
                type: types.FETCH_GLOBAL_PREDICTIONS_SUCCESS, 
                payload: globalPredictions
            }
        )    
    } catch(error) {
        console.error(error)
    }

    console.timeEnd('fetchGlobalPredictions')
}

export function* fetchUSPredictions({payload}) {
    console.time('fetchUSPredictions')

    const dataService = new DataService()

    try {
        console.time('fetchUSPredictions.axios')

        const usPredictions = yield call(dataService.getUSPredictions)

        console.timeEnd('fetchUSPredictions.axios')
        
        yield put(
            { 
                type: types.FETCH_US_PREDICTIONS_SUCCESS, 
                payload: usPredictions
            }
        )    
    } catch(error) {
        console.error(error)
    }

    console.timeEnd('fetchUSPredictions')
}

export function* fetchGlobal({payload}) {
    console.time('fetchGlobal')

    const dataService = new DataService()

    try {
        console.time('fetchGlobal.axios')

        const global = yield call(dataService.getGlobal)

        let confirmed = global.confirmed
        let deaths = global.deaths

        console.timeEnd('fetchGlobal.axios')
        
        for(let filterCountry of filterCountries) {
            delete confirmed[filterCountry]
            delete deaths[filterCountry]
        }
        
        const { mortality } = calculateMortality(deaths, confirmed)

        yield put({ 
                type: types.FETCH_GLOBAL_SUCCESS, 
                confirmed: confirmed, 
                deaths: deaths, 
                mortality: mortality
        })
    } catch(error) {
        console.error(error)
    }

    console.timeEnd('fetchGlobal')
}

export function* fetchContinental() {
    console.time('fetchContinental')

    const dataService = new DataService()

    try {
        console.time('fetchContinental.axios')

        const continental = yield call(dataService.getContinental)

        let confirmed = continental.confirmed
        let deaths = continental.deaths
        console.timeEnd('fetchContinental.axios')

        delete confirmed['Continental Region']
        delete deaths['Continental Region']
        
        const { mortality } = calculateMortality(deaths, confirmed)

        yield put({ 
                type: types.FETCH_CONTINENTAL_SUCCESS, 
                confirmed: confirmed, 
                deaths: deaths, 
                mortality: mortality,
        })
    } catch(error) {
        console.error(error)
    }

    console.timeEnd('fetchContinental')
}

const filterStates = []

export function* fetchUSStates() {
    console.time('fetchUSStates')

    const dataService = new DataService()

    try {
        console.time('fetchUSStates.axios')

        const us_states = yield call(dataService.getUSStates)
        
        let confirmed = us_states.confirmed
        let deaths = us_states.deaths
        let hospitalBeds = us_states.hospitalBeds
        let allCounties = us_states.allCounties

        console.timeEnd('fetchUSStates.axios')

        for(let filterState of filterStates) {
            delete confirmed[filterState]
            delete deaths[filterState]
            delete hospitalBeds[filterState]
            delete allCounties[filterState]
        }

        const { mortality } = calculateMortality(deaths, confirmed)

        yield put({ 
                type: types.FETCH_US_STATES_SUCCESS, 
                confirmed: confirmed, 
                deaths: deaths, 
                mortality: mortality
        })
    } catch(error) {
        console.error(error)
    }

    console.timeEnd('fetchUSStates')
}

export function* fetchUSRegions() {
    console.time('fetchUSRegions')

    const dataService = new DataService()

    try {
        console.time('fetchUSRegions.axios')

        const us_regions = yield call(dataService.getUSRegions)

        let confirmed = us_regions.confirmed
        let deaths = us_regions.deaths
        console.timeEnd('fetchUSRegions.axios')

        const { mortality } = calculateMortality(deaths, confirmed)

        yield put({ 
                type: types.FETCH_US_REGIONS_SUCCESS,
                confirmed: confirmed, 
                deaths: deaths, 
                mortality: mortality
        })    
    } catch(error) {
        console.error(error)
    }

    console.timeEnd('fetchUSRegions')
}

export const sagas = [
    takeEvery(types.FETCH_GLOBAL, fetchGlobal),
    takeEvery(types.FETCH_GLOBAL_PREDICTIONS, fetchGlobalPredictions),
    takeEvery(types.FETCH_CONTINENTAL, fetchContinental),
    takeEvery(types.FETCH_US_PREDICTIONS, fetchUSPredictions),
    takeEvery(types.FETCH_US_STATES, fetchUSStates),
    takeEvery(types.FETCH_US_REGIONS, fetchUSRegions),
]
