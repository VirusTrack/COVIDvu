import axios from "axios"

import { DATA_URL, STAGING_DATA_URL } from './constants'

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

    async getBundle(distinct = '') {
        try {
            const response = await axios.get(`${dataUrl()}/bundle-${distinct}.json`)

            return response.data
        } catch(error) {
            console.error(error)
            return null
        }
    }

    async getConfirmed(distinct = '') {
        try {
            const response = await axios.get(`${dataUrl()}/confirmed${distinct}.json`)

            return response.data
        } catch(error) {
            console.error(error)
            return null
        }
    }

    async getDeaths(distinct = '') {
        const response = await axios.get(`${dataUrl()}/deaths${distinct}.json`)

        return response.data
    }

    async getRecovered(distinct = '') {
        const response = await axios.get(`${dataUrl()}/recovered${distinct}.json`)

        return response.data
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