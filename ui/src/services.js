import axios from "axios"

import { 
    DATA_URL, 
    STAGING_DATA_URL, 
    GLOBAL_KEY, 
    CONTINENTAL_KEY, 
    US_STATES_KEY, 
    US_REGIONS_KEY, 
    CACHE_INVALIDATE_GLOBAL_KEY,
    CACHE_INVALIDATE_CONTINENTAL_KEY,
    CACHE_INVALIDATE_US_STATES_KEY,
    CACHE_INVALIDATE_US_REGIONS_KEY
} from './constants'

import store from 'store2'

import moment from 'moment'

function dataUrl() {
    const { REACT_APP_DEPLOY_ENV, REACT_APP_API_HOST } = process.env
    if (REACT_APP_API_HOST) {
        return REACT_APP_API_HOST
    }

    switch (REACT_APP_DEPLOY_ENV) {
        case "staging":
            return STAGING_DATA_URL
        case "prod":
            return DATA_URL
        default:
            return DATA_URL
    }
}


class DataService {

    async getGlobal() {
        try {
            let global = undefined

            if(!store.session(CACHE_INVALIDATE_GLOBAL_KEY) && store.session(GLOBAL_KEY)) {
                global = store.session(GLOBAL_KEY)
            } else {
                const response = await axios.get(`${dataUrl()}/bundle-global.json`)
                
                global = response.data
                store.session(GLOBAL_KEY, global)
                store.session.remove(CACHE_INVALIDATE_GLOBAL_KEY)
            }
    
            return global
        } catch(error) {
            console.error(error)
            return null
        }
    }

    async getContinental() {
        try {
            let continental = undefined

            if(!store.session(CACHE_INVALIDATE_CONTINENTAL_KEY) && store.session(CONTINENTAL_KEY)) {
                continental = store.session(CONTINENTAL_KEY)
            } else {
                const response = await axios.get(`${dataUrl()}/bundle-continental-regions.json`)
                                
                continental = response.data

                store.session.set(CONTINENTAL_KEY, continental)
                store.session.remove(CACHE_INVALIDATE_CONTINENTAL_KEY)
            }
    
            return continental
        } catch(error) {
            console.error(error)
            return null
        }
    }

    async getUSStates() {
        try {
            let us_states = undefined
            if(!store.session(CACHE_INVALIDATE_US_STATES_KEY) && store.session(US_STATES_KEY)) {
                us_states = store.session(US_STATES_KEY)
            } else {
                const response = await axios.get(`${dataUrl()}/bundle-US.json`)
    
                us_states = response.data
                store.session(US_STATES_KEY, us_states)
                store.session.remove(CACHE_INVALIDATE_US_STATES_KEY)
            }

            return us_states
        } catch(error) {
            console.error(error)
            return null
        }
    }

    async getUSRegions() {
        try {
            let us_regions = undefined

            if(!store.session(CACHE_INVALIDATE_US_REGIONS_KEY) && store.session(US_REGIONS_KEY)) {
                us_regions = store.session(US_REGIONS_KEY)
            } else {
                const response = await axios.get(`${dataUrl()}/bundle-US-Regions.json`)
                us_regions = response.data
    
                store.session(US_REGIONS_KEY, us_regions)
                store.session.remove(CACHE_INVALIDATE_US_REGIONS_KEY)
            }

            return us_regions
        } catch(error) {
            console.error(error)
            return null
        }
    }

    async fetchLastUpdate() {
        const response = await axios.get(`${dataUrl()}/last-update.txt`)

        const lines = response.data.split('\n')

        let lastUpdate = undefined

        for(const line of lines) {
            if(line.startsWith('Completed on')) {
                const justDate = line.substring('Completed on '.length)
                lastUpdate = moment(justDate).format('YYYY-MM-DD HH:mm:ss')
            }
        }

        return lastUpdate
    }
}

export default DataService
