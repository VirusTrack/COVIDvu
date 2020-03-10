import axios from "axios"

import { DATA_URL } from './constants'

class DataService {

    async getConfirmed() {
        try {
            const response = await axios.get(`${DATA_URL}/confirmed.json`)

            return response.data
        } catch(error) {
            console.error(error)
            return null
        }
    }

    async getDeaths() {
        const response = await axios.get(`${DATA_URL}/deaths.json`)

        return response.data
    }

    async getRecovered() {
        const response = await axios.get(`${DATA_URL}/recovered.json`)

        return response.data
    }


    calculateMortalityAndRecovery = (deaths, confirmed, recovered) => {
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
}

export default DataService