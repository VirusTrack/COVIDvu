import {call, put, takeEvery} from "redux-saga/effects"

import DataService from '../services'

import { 
    LAST_UPDATE_KEY, 
    CACHE_INVALIDATE_GLOBAL_KEY,
    CACHE_INVALIDATE_US_STATES_KEY,
    CACHE_INVALIDATE_US_REGIONS_KEY
} from '../constants'

import { createAction } from '@reduxjs/toolkit'

import store from 'store2'
import moment from "moment"

///////////////////////////////////////////////////////////////////////////////
// Action Types
///////////////////////////////////////////////////////////////////////////////

export const types = {
    CLEAR_GRAPHS: 'CLEAR_GRAPHS',

    FETCH_GLOBAL: 'FETCH_GLOBAL',
    FETCH_GLOBAL_SUCCESS: 'FETCH_GLOBAL_SUCCESS',
    FETCH_GLOBAL_ERROR: 'FETCH_GLOBAL_ERROR',

    FETCH_CONTINENTAL: 'FETCH_CONTINENTAL',
    FETCH_CONTINENTAL_SUCCESS: 'FETCH_CONTINENTAL_SUCCESS',
    FETCH_CONTINENTAL_ERROR: 'FETCH_CONTINENTAL_ERROR',

    FETCH_US_STATES: 'FETCH_US_STATES',
    FETCH_US_STATES_SUCCESS: 'FETCH_US_STATES_SUCCESS',
    FETCH_US_STATES_ERROR: 'FETCH_US_STATES_ERROR',

    FETCH_US_REGIONS: 'FETCH_US_REGIONS',
    FETCH_US_REGIONS_SUCCESS: 'FETCH_US_REGIONS_SUCCESS',
    FETCH_US_REGIONS_ERROR: 'FETCH_US_REGIONS_ERROR',

    FETCH_LAST_UPDATE: 'FETCH_LAST_UPDATE',
    FETCH_LAST_UPDATE_SUCCESS: 'FETCH_LAST_UPDATE_SUCCESS',
    FETCH_LAST_UPDATE_ERROR: 'FETCH_LAST_UPDATE_ERROR',

    FETCH_TOP_10_COUNTRIES: 'FETCH_TOP_10_COUNTRIES',
    FETCH_TOP_10_COUNTRIES_SUCCESS: 'FETCH_TOP_10_COUNTRIES_SUCCESS',
    FETCH_TOP_10_COUNTRIES_ERROR: 'FETCH_TOP_10_COUNTRIES_ERROR',

    FETCH_TOP_10_US_STATES: 'FETCH_TOP_10_US_STATES',
    FETCH_TOP_10_US_STATES_SUCCESS: 'FETCH_TOP_10_US_STATES_SUCCESS',
    FETCH_TOP_10_US_STATES_ERROR: 'FETCH_TOP_10_US_STATES_ERROR',

    FETCH_TOTAL_US_STATES_STATS: 'FETCH_TOTAL_US_STATES_STATS',
    FETCH_TOTAL_US_STATES_STATS_SUCCESS: 'FETCH_TOTAL_US_STATES_STATS_SUCCESS',
    FETCH_TOTAL_US_STATES_STATS_ERROR: 'FETCH_TOTAL_US_STATES_STATS_ERROR',

    FETCH_TOTAL_GLOBAL_STATS: 'FETCH_TOTAL_GLOBAL_STATS',
    FETCH_TOTAL_GLOBAL_STATS_SUCCESS: 'FETCH_TOTAL_GLOBAL_STATS_SUCCESS',
    FETCH_TOTAL_GLOBAL_STATS_ERROR: 'FETCH_TOTAL_GLOBAL_STATS_ERROR',

    FETCH_US_STATES_STATS: 'FETCH_US_STATES_STATS',
    FETCH_US_STATES_STATS_SUCCESS: 'FETCH_US_STATES_STATS_SUCCESS',
    FETCH_US_STATES_STATS_ERROR: 'FETCH_US_STATES_STATS_ERROR',

    FETCH_GLOBAL_STATS: 'FETCH_GLOBAL_STATS',
    FETCH_GLOBAL_STATS_SUCCESS: 'FETCH_GLOBAL_STATS_SUCCESS',
    FETCH_GLOBAL_STATS_ERROR: 'FETCH_GLOBAL_STATS_ERROR',
}

///////////////////////////////////////////////////////////////////////////////
// Action Creators
///////////////////////////////////////////////////////////////////////////////

export const actions = {
    clearGraphs: createAction(types.CLEAR_GRAPHS),
    fetchGlobal: createAction(types.FETCH_GLOBAL),
    fetchContinental: createAction(types.FETCH_CONTINENTAL),

    fetchUSStates: createAction(types.FETCH_US_STATES),
    fetchUSRegions: createAction(types.FETCH_US_REGIONS),
    fetchLastUpdate: createAction(types.FETCH_LAST_UPDATE),

    fetchTop10Countries: createAction(types.FETCH_TOP_10_COUNTRIES),
    fetchTop10USStates: createAction(types.FETCH_TOP_10_US_STATES),
    fetchTotalUSStatesStats: createAction(types.FETCH_TOTAL_US_STATES_STATS),
    fetchTotalGlobalStats: createAction(types.FETCH_TOTAL_GLOBAL_STATS),
    fetchUSStatesStats: createAction(types.FETCH_US_STATES_STATS),
    fetchGlobalStats: createAction(types.FETCH_GLOBAL_STATS),
}

///////////////////////////////////////////////////////////////////////////////
// Reducers
///////////////////////////////////////////////////////////////////////////////

export const initialState = {
    global: {},
    continental: {},
    globalTop10: {},
    globalStats: undefined, 
    totalGlobalStats: {}, 
    usStates: {},
    usStatesStats: {},
    totalUSStatesStats: {},
    usStatesTop10: {},
    usRegions: {},
    lastUpdate: undefined
}

export default function (state = initialState, action) {
    // const message = action && action.error ? action.error.message : null
    switch (action.type) {
        case types.CLEAR_GRAPHS:
            return {
                ...state,
                global: {},
                continental: {},
                globalTop10: {},
                globalStats: undefined,
                totalGlobalStats: {},
                usStates: {},
                usStatesStats: undefined,
                totalUSStatesStats: {},
                usStatesTop10: {},
                usRegions: {}
            }
        case types.FETCH_TOP_10_COUNTRIES_SUCCESS:
            return {
                ...state,
                globalTop10: action.payload
            }
        case types.FETCH_TOP_10_US_STATES_SUCCESS:
            return {
                ...state,
                usStatesTop10: action.payload
            }
        case types.FETCH_GLOBAL_SUCCESS:
            return {
                ...state,
                global: { 
                    confirmed: action.confirmed,
                    sortedConfirmed: action.sortedConfirmed,
                    statsTotals: action.statsTotals,
                    deaths: action.deaths,
                    recovered: action.recovered,
                    mortality: action.mortality,
                    recovery: action.recovery
                }
            }
        case types.FETCH_CONTINENTAL_SUCCESS:
            return {
                ...state,
                continental: { 
                    confirmed: action.confirmed,
                    sortedConfirmed: action.sortedConfirmed,
                    statsTotals: action.statsTotals,
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
                    sortedConfirmed: action.sortedConfirmed,
                    statsTotals: action.statsTotals,
                    deaths: action.deaths,
                    recovered: action.recovered,
                    mortality: action.mortality,
                    recovery: action.recovery,
                    // hospitalBeds: action.hospitalBeds,
                }
            }
        case types.FETCH_TOTAL_GLOBAL_STATS_SUCCESS:
            return {
                ...state,
                totalGlobalStats: action.payload
            }
        case types.FETCH_TOTAL_US_STATES_STATS_SUCCESS:
            return {
                ...state,
                totalUSStatesStats: action.payload
            }
        case types.FETCH_GLOBAL_STATS_SUCCESS:
            return {
                ...state,
                globalStats: action.payload
            }
        case types.FETCH_US_STATES_STATS_SUCCESS:
            return {
                ...state,
                usStatesStats: action.payload
            }
        case types.FETCH_US_REGIONS_SUCCESS:
            return {
                ...state,
                usRegions: { 
                    confirmed: action.confirmed,
                    sortedConfirmed: action.sortedConfirmed,
                    deaths: action.deaths,
                    recovered: action.recovered,
                    mortality: action.mortality,
                    recovery: action.recovery
                }
            }
        case types.FETCH_LAST_UPDATE_SUCCESS:
            return {
                ...state,
                lastUpdate: action.payload,
            }
        default:
            return state
    }
}

const calculateMortalityAndRecovery = (deaths, confirmed, recovered) => {
    let mortality = {}
    let recovery = {}

    if(deaths !== null && confirmed !== null && recovered !== null) {
    
        for(const country of Object.keys(deaths)) {
            for(const date of Object.keys(deaths[country])) {
                let deathAtDate = deaths[country][date]

                if(!confirmed.hasOwnProperty(country)) {
                    continue
                }
                let confirmedAtDate = confirmed[country][date]

                if(!recovered.hasOwnProperty(country)) {
                    continue
                }
                let recoveredAtDate = recovered[country][date]

                if(!mortality.hasOwnProperty(country)) {
                    mortality[country] = {}
                }
                if(!recovery.hasOwnProperty(country)) {
                    recovery[country] = {}
                }
                mortality[country][date] = (deathAtDate / confirmedAtDate)
                recovery[country][date] = (recoveredAtDate / confirmedAtDate)
            }
        }
    }

    return { mortality, recovery }
}

const extractLatestCounts = (stats) => {
    const regionWithLatestCounts = []

    for(const region of Object.keys(stats)) {
        const dates = Object.keys(stats[region])

        const lastDate = dates[dates.length - 1]

        const yesterDate = dates[dates.length - 2]

        const currentNumbers = stats[region][lastDate]
        const yesterdayNumbers = stats[region][yesterDate]

        regionWithLatestCounts.push({ region: region, stats: currentNumbers, dayChange: (currentNumbers - yesterdayNumbers) })
    }

    return regionWithLatestCounts
}

///////////////////////////////////////////////////////////////////////////////
// Sagas
///////////////////////////////////////////////////////////////////////////////

/**
 * Fetch last update timestamp from server
 */
export function* fetchLastUpdate() {
    const dataService = new DataService()

    const lastUpdate = yield call(dataService.fetchLastUpdate)

    const lastUpdateAsNumeric = moment(lastUpdate).valueOf()

    const lastUpdateLocalStorage = store.session.get(LAST_UPDATE_KEY)

    if(!lastUpdateLocalStorage || lastUpdateLocalStorage < lastUpdateAsNumeric) {
        store.session.set(CACHE_INVALIDATE_GLOBAL_KEY, true)
        store.session.set(CACHE_INVALIDATE_US_STATES_KEY, true)
        store.session.set(CACHE_INVALIDATE_US_REGIONS_KEY, true)
        store.session.set(LAST_UPDATE_KEY, lastUpdateAsNumeric)
    }
    
    yield put({ type: types.FETCH_LAST_UPDATE_SUCCESS, payload: lastUpdateAsNumeric})
}


export function* fetchTop10USStates({payload}) {
    const dataService = new DataService()

    try {
        const us_states = yield call(dataService.getUSStates)

        delete us_states.confirmed['!Total US']
        delete us_states.confirmed['Unassigned']

        const confirmedCounts = extractLatestCounts(us_states.confirmed)
        const sortedConfirmed = confirmedCounts.sort((a, b) => b.stats - a.stats)

        const top10States = sortedConfirmed.slice(0, 10).map(statesWithStat => statesWithStat.region)

        let top10 = {}

        for(const region of top10States) {
            top10[region] = us_states.confirmed[region]
        }

        yield put({ type: types.FETCH_TOP_10_US_STATES_SUCCESS, payload: top10 })
    } catch(error) {
        console.error(error)
    }
}

export function* fetchTotalUSStatesStats({payload}) {
    const dataService = new DataService()

    try {
        const us_states = yield call(dataService.getUSStates)

        const { mortality, recovery } = calculateMortalityAndRecovery(
            us_states.deaths, 
            us_states.confirmed, 
            us_states.recovered)

        const confirmedCounts = extractLatestCounts(us_states.confirmed)
        const deathsCounts = extractLatestCounts(us_states.deaths)
        const recoveredCounts = extractLatestCounts(us_states.recovered)
        const mortalityCounts = extractLatestCounts(mortality)
        const recoveryCounts = extractLatestCounts(recovery)

        let totalUSCounts = {}

        if(confirmedCounts.length > 0 
            && deathsCounts.length > 0 
            && recoveredCounts.length > 0
            && mortalityCounts.length > 0
            && recoveryCounts.length > 0) {

            totalUSCounts = {
                confirmed: confirmedCounts[0].stats,
                deaths: deathsCounts[0].stats,
                recovered: recoveredCounts[0].stats,
                mortality: mortalityCounts[0].stats,
                recovery: recoveryCounts[0].stats,
                newConfirmed: confirmedCounts[0].dayChange,
                newDeaths: deathsCounts[0].dayChange
            }

            yield put({ type: types.FETCH_TOTAL_US_STATES_STATS_SUCCESS, payload: totalUSCounts})
        } else {
            // throw an error?
        }

    } catch(error) {
        console.error(error)
    }
}

export function* fetchUSStatesStats({payload}) {
    console.time('fetchUSStatesStats')

    const dataService = new DataService()

    try {
        console.time('fetchUSStatesStats.axios')

        const us_states = yield call(dataService.getUSStates)

        let confirmed = us_states.confirmed
        let deaths = us_states.deaths
        let recovered = us_states.recovered
        console.timeEnd('fetchUSStatesStats.axios')

        for(let filterState of filterStates) {
            if(confirmed.hasOwnProperty(filterState)) {
                 delete confirmed[filterState]
            }
            if(deaths.hasOwnProperty(filterState)) {
                 delete deaths[filterState]
            }
            if(recovered.hasOwnProperty(filterState)) {
                 delete recovered[filterState]
            }
        }

        const { mortality, recovery } = calculateMortalityAndRecovery(deaths, confirmed, recovered)

        const confirmedCounts = extractLatestCounts(confirmed)

        const deathsCounts = extractLatestCounts(deaths)
        const recoveredCounts = extractLatestCounts(recovered)
        const mortalityCounts = extractLatestCounts(mortality)
        const recoveryCounts = extractLatestCounts(recovery)
        const sortedConfirmed = confirmedCounts.sort((a, b) => b.stats - a.stats)

        const deathByRegionKey = deathsCounts.reduce((obj, item) => {
            obj[item.region] = item
            return obj
        }, {})

        const recoveredByRegionKey = recoveredCounts.reduce((obj, item) => {
            obj[item.region] = item
            return obj
        }, {})

        const mortalityByRegionKey = mortalityCounts.reduce((obj, item) => {
            obj[item.region] = item
            return obj
        }, {})

        const recoveryByRegionKey = recoveryCounts.reduce((obj, item) => {
            obj[item.region] = item
            return obj
        }, {})

        let statsTotals = []
        
        for(const confirmData of sortedConfirmed) {
            const region = confirmData.region

            if(deathByRegionKey.hasOwnProperty(region)) {
                statsTotals.push({
                    region: region,
                    confirmed: confirmData.stats,
                    confirmedDayChange: confirmData.dayChange,
                    deaths: deathByRegionKey[region].stats,
                    deathsDayChange: deathByRegionKey[region].dayChange,
                    recovered: recoveredByRegionKey[region].stats,
                    mortality: mortalityByRegionKey[region].stats,
                    recovery: recoveryByRegionKey[region].stats
                })
            }
        }

        yield put({
                type: types.FETCH_US_STATES_STATS_SUCCESS, 
                payload: statsTotals
        })
    } catch(error) {
        console.error(error)
    }

    console.timeEnd('fetchUSStatesStats')
}

export function* fetchGlobalStats({payload}) {
    console.time('fetchGlobalStats')

    const dataService = new DataService()

    try {
        console.time('fetchGlobalStats.axios')

        const global = yield call(dataService.getGlobal)

        let confirmed = global.confirmed
        let deaths = global.deaths
        let recovered = global.recovered
        console.timeEnd('fetchGlobalStats.axios')
        
        for(let filterCountry of filterCountries) {
            if(confirmed.hasOwnProperty(filterCountry)) {
                 delete confirmed[filterCountry]
            }
            if(deaths.hasOwnProperty(filterCountry)) {
                 delete deaths[filterCountry]
            }
            if(recovered.hasOwnProperty(filterCountry)) {
                 delete recovered[filterCountry]
            }
        }
        
        const { mortality, recovery } = calculateMortalityAndRecovery(deaths, confirmed, recovered)

        const confirmedCounts = extractLatestCounts(confirmed)
        const deathsCounts = extractLatestCounts(deaths)
        const recoveredCounts = extractLatestCounts(recovered)
        const mortalityCounts = extractLatestCounts(mortality)
        const recoveryCounts = extractLatestCounts(recovery)
        const sortedConfirmed = confirmedCounts.sort((a, b) => b.stats - a.stats)
        
        const deathByCountryKey = deathsCounts.reduce((obj, item) => {
            obj[item.region] = item
            return obj
        }, {})

        const recoveredByCountryKey = recoveredCounts.reduce((obj, item) => {
            obj[item.region] = item
            return obj
        }, {})

        const mortalityByCountryKey = mortalityCounts.reduce((obj, item) => {
            obj[item.region] = item
            return obj
        }, {})

        const recoveryByCountryKey = recoveryCounts.reduce((obj, item) => {
            obj[item.region] = item
            return obj
        }, {})

        let statsTotals = []
        
        for(const confirmData of sortedConfirmed) {
            const region = confirmData.region
            if(deathByCountryKey.hasOwnProperty(region)) {
                statsTotals.push({
                    region: region,
                    confirmed: confirmData.stats,
                    confirmedDayChange: confirmData.dayChange,
                    deaths: deathByCountryKey[region].stats,
                    deathsDayChange: deathByCountryKey[region].dayChange,
                    recovered: recoveredByCountryKey[region].stats,
                    mortality: mortalityByCountryKey[region].stats,
                    recovery: recoveryByCountryKey[region].stats
                })
            }
        }

        yield put(
            { 
                type: types.FETCH_GLOBAL_STATS_SUCCESS, 
                payload: statsTotals,
            }
        )    
    } catch(error) {
        console.error(error)
    }

    console.timeEnd('fetchGlobalStats')
}

export function* fetchTotalGlobalStats({payload}) {
    const dataService = new DataService()

    try {
        const global = yield call(dataService.getGlobal)

        const { mortality, recovery } = calculateMortalityAndRecovery(
            global.deaths, 
            global.confirmed, 
            global.recovered)

        const confirmedCounts = extractLatestCounts(global.confirmed)
        const deathsCounts = extractLatestCounts(global.deaths)
        const recoveredCounts = extractLatestCounts(global.recovered)
        const mortalityCounts = extractLatestCounts(mortality)
        const recoveryCounts = extractLatestCounts(recovery)

        let totalGlobalCounts = {}

        if(confirmedCounts.length > 0 
            && deathsCounts.length > 0 
            && recoveredCounts.length > 0
            && mortalityCounts.length > 0
            && recoveryCounts.length > 0) {

            totalGlobalCounts = {
                confirmed: confirmedCounts[0].stats,
                deaths: deathsCounts[0].stats,
                recovered: recoveredCounts[0].stats,
                mortality: mortalityCounts[0].stats,
                recovery: recoveryCounts[0].stats,
                newConfirmed: confirmedCounts[0].dayChange,
                newDeaths: deathsCounts[0].dayChange
            }

            yield put({ type: types.FETCH_TOTAL_GLOBAL_STATS_SUCCESS, payload: totalGlobalCounts})
        } else {
            // throw an error?
        }

    } catch(error) {
        console.error(error)
    }
}

export function* fetchTop10Countries({payload}) {

    const dataService = new DataService()

    try {
        const global = yield call(dataService.getGlobal)

        delete global.confirmed['!Global']
        delete global.deaths['!Global']
        delete global.recovered['!Global']

        delete global.confirmed['!Outside China']
        delete global.deaths['!Outside China']
        delete global.recovered['!Outside China']

        if(payload && payload.excludeChina) {
            delete global.confirmed['China']
            delete global.deaths['China']
            delete global.recovered['China']
        }

        const confirmedCounts = extractLatestCounts(global.confirmed)
        const sortedConfirmed = confirmedCounts.sort((a, b) => b.stats - a.stats)

        const top10Countries = sortedConfirmed.slice(0, 10).map(countryWithStat => countryWithStat.region)

        let top10 = {}

        for(const country of top10Countries) {
            top10[country] = global.confirmed[country]
        }

        yield put({ type: types.FETCH_TOP_10_COUNTRIES_SUCCESS, payload: top10 })
    } catch(error) {
        console.error(error)
    }
}


const filterCountries = [
    '!Outside China', 
]

export function* fetchGlobal() {
    console.time('fetchGlobal')

    const dataService = new DataService()

    try {
        console.time('fetchGlobal.axios')

        const global = yield call(dataService.getGlobal)

        let confirmed = global.confirmed
        let deaths = global.deaths
        let recovered = global.recovered
        console.timeEnd('fetchGlobal.axios')
        
        for(let filterCountry of filterCountries) {
            if(confirmed.hasOwnProperty(filterCountry)) {
                 delete confirmed[filterCountry]
            }
            if(deaths.hasOwnProperty(filterCountry)) {
                 delete deaths[filterCountry]
            }
            if(recovered.hasOwnProperty(filterCountry)) {
                 delete recovered[filterCountry]
            }
        }
        
        const { mortality, recovery } = calculateMortalityAndRecovery(deaths, confirmed, recovered)

        const confirmedCounts = extractLatestCounts(confirmed)
        const deathsCounts = extractLatestCounts(deaths)
        const recoveredCounts = extractLatestCounts(recovered)
        const mortalityCounts = extractLatestCounts(mortality)
        const recoveryCounts = extractLatestCounts(recovery)
        const sortedConfirmed = confirmedCounts.sort((a, b) => b.stats - a.stats)
        
        const deathByCountryKey = deathsCounts.reduce((obj, item) => {
            obj[item.region] = item
            return obj
        }, {})

        const recoveredByCountryKey = recoveredCounts.reduce((obj, item) => {
            obj[item.region] = item
            return obj
        }, {})

        const mortalityByCountryKey = mortalityCounts.reduce((obj, item) => {
            obj[item.region] = item
            return obj
        }, {})

        const recoveryByCountryKey = recoveryCounts.reduce((obj, item) => {
            obj[item.region] = item
            return obj
        }, {})

        let statsTotals = []
        
        for(const confirmData of sortedConfirmed) {
            const region = confirmData.region
            if(deathByCountryKey.hasOwnProperty(region)) {
                statsTotals.push({
                    region: region,
                    confirmed: confirmData.stats,
                    confirmedDayChange: confirmData.dayChange,
                    deaths: deathByCountryKey[region].stats,
                    deathsDayChange: deathByCountryKey[region].dayChange,
                    recovered: recoveredByCountryKey[region].stats,
                    mortality: mortalityByCountryKey[region].stats,
                    recovery: recoveryByCountryKey[region].stats
                })
            }
        }

        yield put(
            { 
                type: types.FETCH_GLOBAL_SUCCESS, 
                confirmed: confirmed, 
                sortedConfirmed: sortedConfirmed,
                statsTotals: statsTotals,
                deaths: deaths, 
                recovered: recovered,
                mortality: mortality,
                recovery: recovery
            }
        )    
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
        let recovered = continental.recovered
        console.timeEnd('fetchContinental.axios')

        delete confirmed['Continental Region']
        delete deaths['Continental Region']
        delete recovered['Continental Region']
        
        const { mortality, recovery } = calculateMortalityAndRecovery(deaths, confirmed, recovered)

        const confirmedCounts = extractLatestCounts(confirmed)
        const deathsCounts = extractLatestCounts(deaths)
        const recoveredCounts = extractLatestCounts(recovered)
        const mortalityCounts = extractLatestCounts(mortality)
        const recoveryCounts = extractLatestCounts(recovery)
        const sortedConfirmed = confirmedCounts.sort((a, b) => b.stats - a.stats)
        
        const deathByRegionKey = deathsCounts.reduce((obj, item) => {
            obj[item.region] = item
            return obj
        }, {})

        const recoveredByRegionKey = recoveredCounts.reduce((obj, item) => {
            obj[item.region] = item
            return obj
        }, {})

        const mortalityByRegionKey = mortalityCounts.reduce((obj, item) => {
            obj[item.region] = item
            return obj
        }, {})

        const recoveryByRegionKey = recoveryCounts.reduce((obj, item) => {
            obj[item.region] = item
            return obj
        }, {})

        let statsTotals = []
        
        for(const confirmData of sortedConfirmed) {
            const region = confirmData.region
            if(deathByRegionKey.hasOwnProperty(region)) {
                statsTotals.push({
                    region: region,
                    confirmed: confirmData.stats,
                    confirmedDayChange: confirmData.dayChange,
                    deaths: deathByRegionKey[region].stats,
                    deathsDayChange: deathByRegionKey[region].dayChange,
                    recovered: recoveredByRegionKey[region].stats,
                    mortality: mortalityByRegionKey[region].stats,
                    recovery: recoveryByRegionKey[region].stats
                })
            }
        }

        yield put(
            { 
                type: types.FETCH_CONTINENTAL_SUCCESS, 
                confirmed: confirmed, 
                sortedConfirmed: sortedConfirmed,
                statsTotals: statsTotals,
                deaths: deaths, 
                recovered: recovered,
                mortality: mortality,
                recovery: recovery
            }
        )    
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
        let recovered = us_states.recovered
        let hospitalBeds = us_states.hospitalBeds

        console.timeEnd('fetchUSStates.axios')

        for(let filterState of filterStates) {
            if(confirmed.hasOwnProperty(filterState)) {
                 delete confirmed[filterState]
            }
            if(deaths.hasOwnProperty(filterState)) {
                 delete deaths[filterState]
            }
            if(recovered.hasOwnProperty(filterState)) {
                 delete recovered[filterState]
            }
            if(hospitalBeds.hasOwnProperty(filterState)) {
                delete hospitalBeds[filterState]
            }
        }

        const { mortality, recovery } = calculateMortalityAndRecovery(deaths, confirmed, recovered)

        const confirmedCounts = extractLatestCounts(confirmed)

        const deathsCounts = extractLatestCounts(deaths)
        const recoveredCounts = extractLatestCounts(recovered)
        const mortalityCounts = extractLatestCounts(mortality)
        const recoveryCounts = extractLatestCounts(recovery)
        // const hospitalBedsCounts = extractLatestCounts(hospitalBeds)

        const sortedConfirmed = confirmedCounts.sort((a, b) => b.stats - a.stats)

        const deathByRegionKey = deathsCounts.reduce((obj, item) => {
            obj[item.region] = item
            return obj
        }, {})

        const recoveredByRegionKey = recoveredCounts.reduce((obj, item) => {
            obj[item.region] = item
            return obj
        }, {})

        const mortalityByRegionKey = mortalityCounts.reduce((obj, item) => {
            obj[item.region] = item
            return obj
        }, {})

        const recoveryByRegionKey = recoveryCounts.reduce((obj, item) => {
            obj[item.region] = item
            return obj
        }, {})

        // const hospitalBedsByRegionKey = recoveryCounts.reduce((obj, item) => {
        //     obj[item.region] = item
        //     return obj
        // }, {})

        let statsTotals = []
        
        for(const confirmData of sortedConfirmed) {
            const region = confirmData.region

            if(deathByRegionKey.hasOwnProperty(region)) {
                statsTotals.push({
                    region: region,
                    confirmed: confirmData.stats,
                    confirmedDayChange: confirmData.dayChange,
                    deaths: deathByRegionKey[region].stats,
                    deathsDayChange: deathByRegionKey[region].dayChange,
                    recovered: recoveredByRegionKey[region].stats,
                    mortality: mortalityByRegionKey[region].stats,
                    recovery: recoveryByRegionKey[region].stats,
                    // hospitalBeds: hospitalBedsByRegionKey[region].stats,
                })
            }
        }

        yield put(
            { 
                type: types.FETCH_US_STATES_SUCCESS, 
                confirmed: confirmed, 
                sortedConfirmed: sortedConfirmed,
                statsTotals: statsTotals,
                deaths: deaths, 
                recovered: recovered,
                mortality: mortality,
                recovery: recovery,
                // hospitalBeds: hospitalBeds,
            }
        )    
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
        let recovered = us_regions.recovered
        console.timeEnd('fetchUSRegions.axios')

        const latestCounts = extractLatestCounts(confirmed)

        const sortedConfirmed = latestCounts.sort((a, b) => b.confirmed - a.confirmed)

        const { mortality, recovery } = calculateMortalityAndRecovery(deaths, confirmed, recovered)

        yield put(
            { 
                type: types.FETCH_US_REGIONS_SUCCESS,
                confirmed: confirmed, 
                sortedConfirmed: sortedConfirmed,
                deaths: deaths, 
                recovered: recovered,
                mortality: mortality,
                recovery: recovery
            }
        )    
    } catch(error) {
        console.error(error)
    }

    console.timeEnd('fetchUSRegions')
}

export const sagas = [
    takeEvery(types.FETCH_GLOBAL, fetchGlobal),
    takeEvery(types.FETCH_CONTINENTAL, fetchContinental),
    takeEvery(types.FETCH_US_STATES, fetchUSStates),
    takeEvery(types.FETCH_US_REGIONS, fetchUSRegions),
    takeEvery(types.FETCH_LAST_UPDATE, fetchLastUpdate),
    takeEvery(types.FETCH_TOP_10_COUNTRIES, fetchTop10Countries),
    takeEvery(types.FETCH_TOP_10_US_STATES, fetchTop10USStates),

    takeEvery(types.FETCH_TOTAL_US_STATES_STATS, fetchTotalUSStatesStats),
    takeEvery(types.FETCH_TOTAL_GLOBAL_STATS, fetchTotalGlobalStats),

    takeEvery(types.FETCH_US_STATES_STATS, fetchUSStatesStats),
    takeEvery(types.FETCH_GLOBAL_STATS, fetchGlobalStats),
]
