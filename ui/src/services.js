import axios from "axios"

import { 
    DATA_URL, 
    STAGING_DATA_URL, 
    LOCAL_DATA_URL, 
    LAST_UPDATE_KEY,
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
        case "local":
            return LOCAL_DATA_URL
        default:
            return DATA_URL
    }
}

class DataService {

    async getGlobal() {
        try {
            const localUpdate = store.session(LAST_UPDATE_KEY) !== null ? store.session(LAST_UPDATE_KEY) : new Date().getTime()

            const response = await axios.get(`${dataUrl()}/bundle-global.json?timestamp=${localUpdate}`)
            return response.data
        } catch(error) {
            console.error(error)
            return null
        }
    }

    async getGlobalPredictions() {
        try {
            const localUpdate = store.session(LAST_UPDATE_KEY) !== null ? store.session(LAST_UPDATE_KEY) : new Date().getTime()
            const response = await axios.get(`${dataUrl()}/bundle-global-predictions.json?timestamp=${localUpdate}`)                            
            return response.data
        } catch(error) {
            console.error(error)
            return null
        }
    }

    async getUSPredictions() {
        try {
            const localUpdate = store.session(LAST_UPDATE_KEY) !== null ? store.session(LAST_UPDATE_KEY) : new Date().getTime()
            const response = await axios.get(`${dataUrl()}/bundle-US-predictions.json?timestamp=${localUpdate}`)
            return response.data
        } catch(error) {
            console.error(error)
            return null
        }
    }

    async getUSStates() {
        try {
            const localUpdate = store.session(LAST_UPDATE_KEY) !== null ? store.session(LAST_UPDATE_KEY) : new Date().getTime()
            const response = await axios.get(`${dataUrl()}/bundle-US.json?timestamp=${localUpdate}`)
            return response.data
        } catch(error) {
            console.error(error)
            return null
        }
    }

    async getContinental() {
        try {
            const localUpdate = store.session(LAST_UPDATE_KEY) !== null ? store.session(LAST_UPDATE_KEY) : new Date().getTime()
            const response = await axios.get(`${dataUrl()}/bundle-continental-regions.json?timestamp=${localUpdate}`)
            return response.data
        } catch(error) {
            console.error(error)
            return null
        }
    }

    async getUSRegions() {
        try {
            const localUpdate = store.session(LAST_UPDATE_KEY) !== null ? store.session(LAST_UPDATE_KEY) : new Date().getTime()
            const response = await axios.get(`${dataUrl()}/bundle-US-Regions.json?timestamp=${localUpdate}`)
            return response.data
        } catch(error) {
            console.error(error)
            return null
        }
    }

    async fetchLastUpdate() {
        const response = await axios.get(`${dataUrl()}/last-update.txt?timestamp=${new Date().getTime()}`)

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
