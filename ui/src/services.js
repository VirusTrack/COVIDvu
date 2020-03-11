import axios from "axios"

import { DATA_URL } from './constants'

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

}

export default DataService