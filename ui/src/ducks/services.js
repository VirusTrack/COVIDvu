// Action Types
import {call, put, takeEvery} from "redux-saga/effects"

import store from 'store'
import DataService from '../services'

import { createAction } from '@reduxjs/toolkit'

// Action Types
export const types = {
    FETCH_GLOBAL: 'FETCH_GLOBAL',
    FETCH_GLOBAL_SUCCESS: 'FETCH_GLOBAL_SUCCESS',
    FETCH_GLOBAL_ERROR: 'FETCH_GLOBAL_ERROR',

    FETCH_US_STATES: 'FETCH_US_STATES',
    FETCH_US_STATES_SUCCESS: 'FETCH_US_STATES_SUCCESS',
    FETCH_US_STATES_ERROR: 'FETCH_US_STATES_ERROR',

    FETCH_US_REGIONS: 'FETCH_US_REGIONS',
    FETCH_US_REGIONS_SUCCESS: 'FETCH_US_REGIONS_SUCCESS',
    FETCH_US_REGIONS_ERROR: 'FETCH_US_REGIONS_ERROR',


}

// Action Creators
export const actions = {
    fetchGlobal: createAction(types.FETCH_GLOBAL),
    fetchUSStates: createAction(types.FETCH_US_STATES),
    fetchUSRegions: createAction(types.FETCH_US_REGIONS),
}

// Reducers
export const initialState = {
    global: {},
    usStates: {},
    usRegions: {},
}

export default function (state = initialState, action) {
    // const message = action && action.error ? action.error.message : null
    switch (action.type) {
        case types.FETCH_GLOBAL_SUCCESS:
            return {
                ...state,
                global: { 
                    confirmed: action.confirmed,
                    deaths: action.deaths,
                    recovered: action.recovered,
                    mortality: action.mortality,
                    recovery: action.recovery
                }
            }
        case types.FETCH_US_STATES_SUCCESS:
            return {
                ...state,
                usStates: { 
                    confirmed: action.confirmed,
                    deaths: action.deaths,
                    recovered: action.recovered,
                    mortality: action.mortality,
                    recovery: action.recovery
                }
            }
        case types.FETCH_US_REGIONS_SUCCESS:
            return {
                ...state,
                usRegions: { 
                    confirmed: action.confirmed,
                    deaths: action.deaths,
                    recovered: action.recovered,
                    mortality: action.mortality,
                    recovery: action.recovery
                }
            }
        default:
            return state
    }
}

const calculateMortalityAndRecovery = (deaths, confirmed, recovered) => {
    let mortality = {}
    let recovery = {}

    if(deaths !== null && confirmed !== null && recovered !== null) {
    

        Object.keys(deaths).map(country => {
            Object.keys(deaths[country]).map(date => {
                let deathAtDate = deaths[country][date]
                let confirmedAtDate = confirmed[country][date]
                let recoveredAtDate = recovered[country][date]

                if(!mortality.hasOwnProperty(country)) {
                    mortality[country] = {}
                }
                if(!recovery.hasOwnProperty(country)) {
                    recovery[country] = {}
                }
                mortality[country][date] = deathAtDate / confirmedAtDate
                recovery[country][date] = recoveredAtDate / confirmedAtDate
            })
        })

    }

    return { mortality, recovery }

}

// Sagas
export function* fetchGlobal() {
    const dataService = new DataService()

    try {
        const confirmed = yield call(dataService.getConfirmed)
        const deaths = yield call(dataService.getDeaths)
        const recovered = yield call(dataService.getRecovered)

        const { mortality, recovery } = dataService.calculateMortalityAndRecovery(deaths, confirmed, recovered)

        // let statsTotals = {}
        
        // for(const country of Object.keys(confirmed)) {
        //     console.log(confirmed[country])
        // }

        yield put(
            { 
                type: types.FETCH_GLOBAL_SUCCESS, 
                confirmed: confirmed, 
                deaths: deaths, 
                recovered: recovered,
                mortality: mortality,
                recovery: recovery
            }
        )    
    } catch(error) {
        console.error(error)
    }
}

export function* fetchUSStates() {
    const dataService = new DataService()

    try {
        const confirmed = yield call(dataService.getConfirmed, '-US')
        const deaths = yield call(dataService.getDeaths, '-US')
        const recovered = yield call(dataService.getRecovered, '-US')

        const { mortality, recovery } = dataService.calculateMortalityAndRecovery(deaths, confirmed, recovered)

        yield put(
            { 
                type: types.FETCH_US_STATES_SUCCESS, 
                confirmed: confirmed, 
                deaths: deaths, 
                recovered: recovered,
                mortality: mortality,
                recovery: recovery
            }
        )    
    } catch(error) {
        console.error(error)
    }
}

export function* fetchUSRegions() {
    const dataService = new DataService()

    try {
        const confirmed = yield call(dataService.getConfirmed, '-US-Regions')
        const deaths = yield call(dataService.getDeaths, '-US-Regions')
        const recovered = yield call(dataService.getRecovered, '-US-Regions')

        const { mortality, recovery } = dataService.calculateMortalityAndRecovery(deaths, confirmed, recovered)

        yield put(
            { 
                type: types.FETCH_US_REGIONS_SUCCESS,
                confirmed: confirmed, 
                deaths: deaths, 
                recovered: recovered,
                mortality: mortality,
                recovery: recovery
            }
        )    
    } catch(error) {
        console.error(error)
    }
}

export const sagas = [
    takeEvery(types.FETCH_GLOBAL, fetchGlobal),
    takeEvery(types.FETCH_US_STATES, fetchUSStates),
    takeEvery(types.FETCH_US_REGIONS, fetchUSRegions),
]