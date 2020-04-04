import {call, put, takeEvery} from "redux-saga/effects"

import DataService from '../services'

import { 
    US_STATES_WITH_ABBREVIATION,
    LAST_UPDATE_KEY, 
    CLIENT_COUNTRY_KEY,
    CLIENT_COUNTRY_CODE_KEY,
} from '../constants'

import { createAction } from '@reduxjs/toolkit'

import store from 'store2'
import moment from "moment"

const countriesRegions = require('../constants/countries_regions.json');

///////////////////////////////////////////////////////////////////////////////
// Action Types
///////////////////////////////////////////////////////////////////////////////

export const types = {
    CLEAR_GRAPHS: 'CLEAR_GRAPHS',
    CLEAR_STATS: 'CLEAR_STATS',

    FETCH_CLIENT_COUNTRY: 'FETCH_CLIENT_COUNTRY',
    FETCH_CLIENT_COUNTRY_SUCCESS: 'FETCH_CLIENT_COUNTRY_SUCCESS',
    FETCH_CLIENT_COUNTRY_ERROR: 'FETCH_CLIENT_COUNTRY_ERROR',

    FETCH_GLOBAL: 'FETCH_GLOBAL',
    FETCH_GLOBAL_SUCCESS: 'FETCH_GLOBAL_SUCCESS',
    FETCH_GLOBAL_ERROR: 'FETCH_GLOBAL_ERROR',

    FETCH_GLOBAL_PREDICTIONS: 'FETCH_GLOBAL_PREDICTIONS',
    FETCH_GLOBAL_PREDICTIONS_SUCCESS: 'FETCH_GLOBAL_PREDICTIONS_SUCCESS',
    FETCH_GLOBAL_PREDICTIONS_ERROR: 'FETCH_GLOBAL_PREDICTIONS_ERROR',

    FETCH_US_PREDICTIONS: 'FETCH_US_PREDICTIONS',
    FETCH_US_PREDICTIONS_SUCCESS: 'FETCH_US_PREDICTIONS_SUCCESS',
    FETCH_US_PREDICTIONS_ERROR: 'FETCH_US_PREDICTIONS_ERROR',

    FETCH_REGION: 'FETCH_REGION',
    FETCH_REGION_SUCCESS: 'FETCH_REGION_SUCCESS',
    FETCH_REGION_ERROR: 'FETCH_REGION_ERROR',

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

    FETCH_US_COUNTIES_STATS: 'FETCH_US_COUNTIES_STATS',
    FETCH_US_COUNTIES_STATS_SUCCESS: 'FETCH_US_COUNTIES_STATS_SUCCESS',
    FETCH_US_COUNTIES_STATS_ERROR: 'FETCH_US_COUNTIES_STATS_ERROR',

    FETCH_GLOBAL_STATS: 'FETCH_GLOBAL_STATS',
    FETCH_GLOBAL_STATS_SUCCESS: 'FETCH_GLOBAL_STATS_SUCCESS',
    FETCH_GLOBAL_STATS_ERROR: 'FETCH_GLOBAL_STATS_ERROR',
}

///////////////////////////////////////////////////////////////////////////////
// Action Creators
///////////////////////////////////////////////////////////////////////////////

export const actions = {
    clearGraphs: createAction(types.CLEAR_GRAPHS),
    clearStats: createAction(types.CLEAR_STATS),

    fetchClientCountry: createAction(types.FETCH_CLIENT_COUNTRY),

    fetchGlobal: createAction(types.FETCH_GLOBAL),
    fetchGlobalPredictions: createAction(types.FETCH_GLOBAL_PREDICTIONS),
    fetchUSPredictions: createAction(types.FETCH_US_PREDICTIONS),

    fetchRegion: createAction(types.FETCH_REGION),
    fetchContinental: createAction(types.FETCH_CONTINENTAL),

    fetchUSStates: createAction(types.FETCH_US_STATES),
    fetchUSRegions: createAction(types.FETCH_US_REGIONS),
    fetchLastUpdate: createAction(types.FETCH_LAST_UPDATE),

    fetchTop10Countries: createAction(types.FETCH_TOP_10_COUNTRIES),
    fetchTop10USStates: createAction(types.FETCH_TOP_10_US_STATES),
    fetchTotalUSStatesStats: createAction(types.FETCH_TOTAL_US_STATES_STATS),
    fetchTotalGlobalStats: createAction(types.FETCH_TOTAL_GLOBAL_STATS),
    fetchUSCountiesStats: createAction(types.FETCH_US_COUNTIES_STATS),
    fetchUSStatesStats: createAction(types.FETCH_US_STATES_STATS),
    fetchGlobalStats: createAction(types.FETCH_GLOBAL_STATS),
}

///////////////////////////////////////////////////////////////////////////////
// Reducers
///////////////////////////////////////////////////////////////////////////////

export const initialState = {
    global: {},
    globalPredictions: {},
    usPredictions: {},
    region: {},
    continental: {},
    globalTop10: {},
    globalNamesTop10: {},
    globalStats: undefined, 
    totalGlobalStats: {}, 
    usStates: {},
    usStatesStats: undefined,
    totalUSStatesStats: {},
    usStatesTop10: {},
    usStateNamesTop10: [],
    usRegions: {},
    clientCountry: undefined,
    lastUpdate: undefined
}

export default function (state = initialState, action) {
    switch (action.type) {
        case types.CLEAR_GRAPHS:
            return {
                ...state,
                global: {},
                globalPredictions: {},
                usPredictions: {},
                region: {},
                continental: {},
                globalTop10: {},
                globalNamesTop10: {},
                globalStats: undefined,
                totalGlobalStats: {},
                usStates: {},
                usStatesStats: undefined,
                totalUSStatesStats: {},
                usStatesTop10: {},
                usStateNamesTop10: [],
                usRegions: {},
                clientCountry: undefined,
            }
        case types.CLEAR_STATS:
            return {
                ...state,
                globalStats: undefined,
                usStatesStats: undefined,
            }
        case types.FETCH_CLIENT_COUNTRY_SUCCESS:
            return {
                ...state,
                clientCountry: action.payload,
            }
        case types.FETCH_TOP_10_COUNTRIES_SUCCESS:
            return {
                ...state,
                globalTop10: action.payload,
                globalNamesTop10: action.top10CountryNames,
            }
        case types.FETCH_TOP_10_US_STATES_SUCCESS:
            return {
                ...state,
                usStatesTop10: action.payload,
                usStateNamesTop10: action.top10StateNames
            }
        case types.FETCH_GLOBAL_SUCCESS:
            return {
                ...state,
                global: { 
                    confirmed: action.confirmed,
                    sortedConfirmed: action.sortedConfirmed,
                    statsTotals: action.statsTotals,
                    deaths: action.deaths,
                    mortality: action.mortality,
                }
            }
        case types.FETCH_GLOBAL_PREDICTIONS_SUCCESS:
            return {
                ...state,
                globalPredictions: action.payload
            }
        case types.FETCH_US_PREDICTIONS_SUCCESS:
            return {
                ...state,
                usPredictions: action.payload
            }
        case types.FETCH_REGION_SUCCESS:
            return {
                ...state,
                region: {
                    [action.region]: {
                        confirmed: action.confirmed,
                        sortedConfirmed: action.sortedConfirmed,
                        statsTotals: action.statsTotals,
                        deaths: action.deaths,
                        mortality: action.mortality,
                    }
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
        case types.FETCH_US_COUNTIES_STATS_SUCCESS:
            return {
                ...state,
                usCountiesStats: action.payload
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
        case types.FETCH_LAST_UPDATE_SUCCESS:
            return {
                ...state,
                lastUpdate: action.payload,
            }
        default:
            return state
    }
}

const calculateMortality = (deaths, confirmed) => {
    let mortality = {}

    if(deaths !== null && confirmed !== null) {
    
        for(const country of Object.keys(deaths)) {
            for(const date of Object.keys(deaths[country])) {
                let deathAtDate = deaths[country][date]

                if(!confirmed.hasOwnProperty(country)) {
                    continue
                }
                let confirmedAtDate = confirmed[country][date]

                if(!mortality.hasOwnProperty(country)) {
                    mortality[country] = {}
                }
                mortality[country][date] = (deathAtDate / confirmedAtDate)
            }
        }
    }

    return { mortality }
}

const extractLatestCounts = (stats, daysAgo = 0) => {

    // const today = moment().subtract(0 + daysAgo, 'days').format("YYYY-MM-DD")
    // const yesterday = moment().subtract(1 + daysAgo, 'days').format("YYYY-MM-DD")

    const regionWithLatestCounts = []

    for(const region of Object.keys(stats)) {
        const dates = Object.keys(stats[region]).sort()

        const lastDate = dates[dates.length - daysAgo - 1]

        const yesterDate = dates[dates.length - daysAgo - 2]

        const currentNumbers = stats[region][lastDate]
        const yesterdayNumbers = stats[region][yesterDate]

        regionWithLatestCounts.push({ region: region, stats: currentNumbers, dayChange: (currentNumbers - yesterdayNumbers) })
    }

    return regionWithLatestCounts
}

function roughSizeOfObject( object ) {

    var objectList = [];
    var stack = [ object ];
    var bytes = 0;

    while ( stack.length ) {
        var value = stack.pop();

        if ( typeof value === 'boolean' ) {
            bytes += 4;
        }
        else if ( typeof value === 'string' ) {
            bytes += value.length * 2;
        }
        else if ( typeof value === 'number' ) {
            bytes += 8;
        }
        else if
        (
            typeof value === 'object'
            && objectList.indexOf( value ) === -1
        )
        {
            objectList.push( value );

            for( var i in value ) {
                stack.push( value[ i ] );
            }
        }
    }
    return bytes;
}

const groupByKey = (key, array) => {
    return array.reduce((obj, item) => {
        const objKey = item[key]
        obj[objKey] = item
        return obj
    }, {})
}

///////////////////////////////////////////////////////////////////////////////
// Sagas
///////////////////////////////////////////////////////////////////////////////


export function* fetchClientCountry() {
    console.time("fetchClientCountry")
    const dataService = new DataService()

    let countryISO = store.get(CLIENT_COUNTRY_CODE_KEY) || "US"
    let country = store.get(CLIENT_COUNTRY_KEY) || "US"

    if(!store.get(CLIENT_COUNTRY_CODE_KEY) || !store.get(CLIENT_COUNTRY_KEY)) {
        console.log("No client country cached, grabbing fresh.")
        try {
            const countryObject = yield call(dataService.fetchUserCountry)
            countryISO = countryObject.codeISO
            country = countryObject.name

            console.log(`Data grabbed, countryISO: ${countryISO} and country: ${country}`)
        } catch(error) {
            console.error("Unable to grab data from fetchUserCountry service, defaulting to US")
            countryISO = "US"
            country = "US"
        }
        store.set(CLIENT_COUNTRY_CODE_KEY, countryISO ? countryISO : 'US')
        store.set(CLIENT_COUNTRY_KEY, country ? country : 'US')
    }

    yield put({ type: types.FETCH_CLIENT_COUNTRY_SUCCESS, payload: {
            countryISO: countryISO,
            country: country
        }
    })

    console.timeEnd("fetchClientCountry")
}

/**
 * Fetch last update timestamp from server
 */
export function* fetchLastUpdate() {
    const dataService = new DataService()
    
    const lastUpdate = yield call(dataService.fetchLastUpdate)
    const lastUpdateAsNumeric = moment(lastUpdate).valueOf()
    const lastUpdateLocalStorage = store.session.get(LAST_UPDATE_KEY)

    if(!lastUpdateLocalStorage || lastUpdateLocalStorage < lastUpdateAsNumeric) {
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

        yield put({ type: types.FETCH_TOP_10_US_STATES_SUCCESS, payload: top10, top10StateNames: top10States})
    } catch(error) {
        console.error(error)
    }
}

export function* fetchTotalUSStatesStats({payload}) {
    const dataService = new DataService()

    try {
        const us_states = yield call(dataService.getUSStates)

        const { mortality } = calculateMortality(us_states.deaths, us_states.confirmed)

        const confirmedCounts = extractLatestCounts(us_states.confirmed)
        const deathsCounts = extractLatestCounts(us_states.deaths)
        const mortalityCounts = extractLatestCounts(mortality)

        let totalUSCounts = {}

        if(confirmedCounts.length > 0 
            && deathsCounts.length > 0 
            && mortalityCounts.length > 0) {

            totalUSCounts = {
                confirmed: confirmedCounts[0].stats,
                deaths: deathsCounts[0].stats,
                mortality: mortalityCounts[0].stats,
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

export function* fetchUSCountiesStats({payload}) {
    console.time('fetchUSCountiesStats')

    const dataService = new DataService()

    let daysAgo = 0
    let filterRegion = undefined
    let sort = "confirmed"
    if(payload) {
        if(payload.daysAgo && !isNaN(daysAgo)) {
            daysAgo = payload.daysAgo
        }

        filterRegion = payload.filterRegion ? payload.filterRegion : undefined      
    }

    if(payload && payload.sort) {
        sort = payload.sort
    }

    try {
        console.time('fetchUSCountiesStats.axios')

        const us_states = yield call(dataService.getUSStates)

        // let hospitalBeds = us_states.hospitalBeds
        let allCounties = us_states.allCounties

        console.timeEnd('fetchUSCountiesStats.axios')

        let countiesWithAbbreviation = []

        for(const usState of Object.keys(allCounties)) {
            let trimmedUSState = usState.trim()
            const countiesInState = allCounties[usState]

            const abbreviation = US_STATES_WITH_ABBREVIATION[trimmedUSState]
            
            if(filterRegion && filterRegion !== abbreviation) {
                continue
            }
                        
            for(let county of Object.keys(countiesInState)) {
                countiesWithAbbreviation.push({region: `${county}, ${abbreviation}`, confirmed: countiesInState[county].confirmed, deaths: countiesInState[county].deaths})
            }
            
        }

        let sortedCounties = []

        if(sort === 'confirmed') {
            sortedCounties = countiesWithAbbreviation.sort((a, b) => b.confirmed - a.confirmed)
        } else if(sort === 'deaths') {
            sortedCounties = countiesWithAbbreviation.sort((a, b) => b.deaths - a.deaths)
        }

        yield put({
            type: types.FETCH_US_COUNTIES_STATS_SUCCESS, 
            payload: sortedCounties
        })

    } catch(error) {
        console.error(error)
    }
    console.timeEnd('fetchUSCountiesStats')
}

export function* fetchUSStatesStats({payload}) {
    console.time('fetchUSStatesStats')

    const dataService = new DataService()

    let daysAgo = 0
    let sort = "confirmed"
    if(payload && payload.daysAgo && !isNaN(daysAgo)) {
        daysAgo = payload.daysAgo
    }

    if(payload && payload.sort) {
        sort = payload.sort
    }

    try {
        console.time('fetchUSStatesStats.axios')

        const us_states = yield call(dataService.getUSStates)

        let confirmed = us_states.confirmed
        let deaths = us_states.deaths
        let hospitalBeds = us_states.hospitalBeds

        console.timeEnd('fetchUSStatesStats.axios')

        for(let filterState of filterStates) {
            if(confirmed.hasOwnProperty(filterState)) {
                 delete confirmed[filterState]
            }
            if(deaths.hasOwnProperty(filterState)) {
                 delete deaths[filterState]
            }
            if(hospitalBeds.hasOwnProperty(filterState)) {
                 delete hospitalBeds[filterState]
            }
        }

        let totalBeds = Object.values(hospitalBeds).reduce((total, beds) => total + beds)

        hospitalBeds['!Total US'] = totalBeds

        const { mortality } = calculateMortality(deaths, confirmed)

        const confirmedCounts = extractLatestCounts(confirmed, daysAgo)
        const deathsCounts = extractLatestCounts(deaths, daysAgo)
        const mortalityCounts = extractLatestCounts(mortality, daysAgo)

        let sorted = []

        if(sort === 'confirmed') {
            sorted = confirmedCounts.sort((a, b) => b.stats - a.stats)
        } else if(sort === 'deaths') {
            sorted = deathsCounts.sort((a, b) => b.stats - a.stats)
        } else if(sort === 'mortality') {
            sorted = mortalityCounts.sort((a, b) => b.stats - a.stats)
        }

        const deathByRegionKey = groupByKey("region", deathsCounts)
        const mortalityByRegionKey = groupByKey("region", mortalityCounts)

        let statsTotals = []
        
        for(const data of sorted) {
            const region = data.region

            if(deathByRegionKey.hasOwnProperty(region)) {
                statsTotals.push({
                    region: region,
                    confirmed: data.stats,
                    confirmedDayChange: data.dayChange,
                    deaths: deathByRegionKey[region].stats,
                    deathsDayChange: deathByRegionKey[region].dayChange,
                    mortality: mortalityByRegionKey[region].stats,
                    hospitalBeds: hospitalBeds[region]
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

    let daysAgo = 0
    const sort = (payload && payload.sort) ? payload.sort : "confirmed"
    if(payload && payload.daysAgo && !isNaN(daysAgo)) {
        daysAgo = payload.daysAgo
    }

    const dataService = new DataService()

    try {
        console.time('fetchGlobalStats.axios')

        const global = yield call(dataService.getGlobal)

        let { confirmed, deaths } = global

        console.timeEnd('fetchGlobalStats.axios')
        
        for(let filterCountry of filterCountries) {
            delete confirmed[filterCountry]
            delete deaths[filterCountry]
        }

        const { mortality } = calculateMortality(deaths, confirmed)

        const confirmedCounts = extractLatestCounts(confirmed, daysAgo)
        const deathsCounts = extractLatestCounts(deaths, daysAgo)
        const mortalityCounts = extractLatestCounts(mortality, daysAgo)

        let sorted = []

        if(sort === 'confirmed') {
            sorted = confirmedCounts.sort((a, b) => b.stats - a.stats)
        } else if(sort === 'deaths') {
            sorted = deathsCounts.sort((a, b) => b.stats - a.stats)
        } else if(sort === 'mortality') {
            sorted = mortalityCounts.sort((a, b) => b.stats - a.stats)
        }
        
        const deathByCountryKey = groupByKey("region", deathsCounts)
        const mortalityByCountryKey = groupByKey("region", mortalityCounts)

        let statsTotals = []
        
        for(const data of sorted) {
            const region = data.region
            if(deathByCountryKey.hasOwnProperty(region)) {
                statsTotals.push({
                    region: region,
                    confirmed: data.stats,
                    confirmedDayChange: data.dayChange,
                    deaths: deathByCountryKey[region].stats,
                    deathsDayChange: deathByCountryKey[region].dayChange,
                    mortality: mortalityByCountryKey[region].stats,
                })
            }
        }
        console.log(roughSizeOfObject(statsTotals))

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

        const { mortality } = calculateMortality(
            global.deaths, 
            global.confirmed)

        const confirmedCounts = extractLatestCounts(global.confirmed)
        const deathsCounts = extractLatestCounts(global.deaths)
        const mortalityCounts = extractLatestCounts(mortality)

        let totalGlobalCounts = {}

        if(confirmedCounts.length > 0 
            && deathsCounts.length > 0 
            && mortalityCounts.length > 0) {

            totalGlobalCounts = {
                confirmed: confirmedCounts[0].stats,
                deaths: deathsCounts[0].stats,
                mortality: mortalityCounts[0].stats,
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

        delete global.confirmed['!Outside China']
        delete global.deaths['!Outside China']

        if(payload && payload.excludeChina) {
            delete global.confirmed['China']
            delete global.deaths['China']
        }

        const confirmedCounts = extractLatestCounts(global.confirmed)
        const sortedConfirmed = confirmedCounts.sort((a, b) => b.stats - a.stats)

        const top10Countries = sortedConfirmed.slice(0, 10).map(countryWithStat => countryWithStat.region)

        let top10 = {}

        for(const country of top10Countries) {
            top10[country] = global.confirmed[country]
        }

        yield put({ type: types.FETCH_TOP_10_COUNTRIES_SUCCESS, payload: top10, top10CountryNames: top10Countries })
    } catch(error) {
        console.error(error)
    }
}


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

        const confirmedCounts = extractLatestCounts(confirmed)
        const deathsCounts = extractLatestCounts(deaths)
        const mortalityCounts = extractLatestCounts(mortality)
        const sortedConfirmed = confirmedCounts.sort((a, b) => b.stats - a.stats)
        
        const deathByCountryKey = groupByKey("region", deathsCounts)
        const mortalityByCountryKey = groupByKey("region", mortalityCounts)

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
                    mortality: mortalityByCountryKey[region].stats
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
                mortality: mortality
            }
        )    
    } catch(error) {
        console.error(error)
    }

    console.timeEnd('fetchGlobal')
}

export function* fetchRegion({payload}) {
    console.time('fetchRegion')

    const dataService = new DataService()

    let region = (payload && payload.region) ? payload.region : undefined

    if(!region) {
        yield put({ type: types.FETCH_REGION_ERROR, error: 'No region defined'})
        return
    }

    try {
        console.time('fetchRegion.axios')

        const global = yield call(dataService.getGlobal)

        let { confirmed, deaths } = global

        console.timeEnd('fetchRegion.axios')
        
        for(const country of Object.keys(confirmed)) {
            if(countriesRegions[country] !== region) {
                delete confirmed[country]
                delete deaths[country]
            }
        }    
        const { mortality } = calculateMortality(deaths, confirmed)

        const confirmedCounts = extractLatestCounts(confirmed)
        const deathsCounts = extractLatestCounts(deaths)
        const mortalityCounts = extractLatestCounts(mortality)
        const sortedConfirmed = confirmedCounts.sort((a, b) => b.stats - a.stats)
        
        const deathByCountryKey = groupByKey("region", deathsCounts)
        const mortalityByCountryKey = groupByKey("region", mortalityCounts)

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
                    mortality: mortalityByCountryKey[region].stats
                })
            }
        }

        yield put(
            { 
                type: types.FETCH_REGION_SUCCESS,
                region: region,
                confirmed: confirmed, 
                sortedConfirmed: sortedConfirmed,
                statsTotals: statsTotals,
                deaths: deaths, 
                mortality: mortality
            }
        )    
    } catch(error) {
        console.error(error)
    }

    console.timeEnd('fetchRegion')
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

        const confirmedCounts = extractLatestCounts(confirmed)
        const deathsCounts = extractLatestCounts(deaths)
        const mortalityCounts = extractLatestCounts(mortality)
        const sortedConfirmed = confirmedCounts.sort((a, b) => b.stats - a.stats)
        
        const deathByRegionKey = groupByKey("region", deathsCounts)
        const mortalityByRegionKey = groupByKey("region", mortalityCounts)

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
                    mortality: mortalityByRegionKey[region].stats
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
                mortality: mortality,
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

        const confirmedCounts = extractLatestCounts(confirmed)

        const deathsCounts = extractLatestCounts(deaths)
        const mortalityCounts = extractLatestCounts(mortality)

        const sortedConfirmed = confirmedCounts.sort((a, b) => b.stats - a.stats)

        const deathByRegionKey = groupByKey("region", deathsCounts)
        const mortalityByRegionKey = groupByKey("region", mortalityCounts)

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
                    mortality: mortalityByRegionKey[region].stats
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
                mortality: mortality
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
        console.timeEnd('fetchUSRegions.axios')

        const latestCounts = extractLatestCounts(confirmed)

        const sortedConfirmed = latestCounts.sort((a, b) => b.confirmed - a.confirmed)

        const { mortality } = calculateMortality(deaths, confirmed)

        yield put(
            { 
                type: types.FETCH_US_REGIONS_SUCCESS,
                confirmed: confirmed, 
                sortedConfirmed: sortedConfirmed,
                deaths: deaths, 
                mortality: mortality
            }
        )    
    } catch(error) {
        console.error(error)
    }

    console.timeEnd('fetchUSRegions')
}

export const sagas = [
    takeEvery(types.FETCH_GLOBAL, fetchGlobal),
    takeEvery(types.FETCH_GLOBAL_PREDICTIONS, fetchGlobalPredictions),
    takeEvery(types.FETCH_REGION, fetchRegion),
    takeEvery(types.FETCH_CONTINENTAL, fetchContinental),

    takeEvery(types.FETCH_CLIENT_COUNTRY, fetchClientCountry),

    takeEvery(types.FETCH_US_PREDICTIONS, fetchUSPredictions),

    takeEvery(types.FETCH_US_STATES, fetchUSStates),
    takeEvery(types.FETCH_US_REGIONS, fetchUSRegions),
    takeEvery(types.FETCH_LAST_UPDATE, fetchLastUpdate),
    takeEvery(types.FETCH_TOP_10_COUNTRIES, fetchTop10Countries),
    takeEvery(types.FETCH_TOP_10_US_STATES, fetchTop10USStates),

    takeEvery(types.FETCH_TOTAL_US_STATES_STATS, fetchTotalUSStatesStats),
    takeEvery(types.FETCH_TOTAL_GLOBAL_STATS, fetchTotalGlobalStats),

    takeEvery(types.FETCH_US_STATES_STATS, fetchUSStatesStats),
    takeEvery(types.FETCH_US_COUNTIES_STATS, fetchUSCountiesStats),
    takeEvery(types.FETCH_GLOBAL_STATS, fetchGlobalStats),
]
