import axios from "axios"

import { 
    DATA_URL, 
    STAGING_DATA_URL, 
    LOCAL_DATA_URL, 
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
            let global = undefined

            const response = await axios.get(`${dataUrl()}/bundle-global.json`)
            
            global = response.data
    
            return global
        } catch(error) {
            console.error(error)
            return null
        }
    }

    async getContinental() {
        try {
            let continental = undefined

            const response = await axios.get(`${dataUrl()}/bundle-continental-regions.json`)
                            
            continental = response.data
    
            return continental
        } catch(error) {
            console.error(error)
            return null
        }
    }

    async getUSStates() {
        try {
            let us_states = undefined
            const response = await axios.get(`${dataUrl()}/bundle-US.json`)

            us_states = response.data

            return us_states
        } catch(error) {
            console.error(error)
            return null
        }
    }

    async getUSRegions() {
        try {
            let us_regions = undefined

            const response = await axios.get(`${dataUrl()}/bundle-US-Regions.json`)
            us_regions = response.data

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
