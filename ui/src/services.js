import axios from "axios"

import { DATA_URL } from './constants'

import moment from 'moment'

class DataService {

    async getConfirmed(distinct = '') {
        try {
            const response = await axios.get(`${DATA_URL}/confirmed${distinct}.json`)

            return response.data
        } catch(error) {
            console.error(error)
            return null
        }
    }

    async getDeaths(distinct = '') {
        const response = await axios.get(`${DATA_URL}/deaths${distinct}.json`)

        return response.data
    }

    async getRecovered(distinct = '') {
        const response = await axios.get(`${DATA_URL}/recovered${distinct}.json`)

        return response.data
    }

    async fetchLastUpdate() {
        const response = await axios.get(`${DATA_URL}/last-update.txt`)
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