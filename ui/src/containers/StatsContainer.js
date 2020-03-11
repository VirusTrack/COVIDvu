import React, { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { actions } from '../ducks/services'

import { COUNTRIES } from '../constants'

import { Table } from 'rbx'

import numeral from 'numeral'

export const StatsContainer = () => {

    const dispatch = useDispatch()
      
    const [selectedCountries, setSelectedCountries] = useState(['!Global', '!Outside Mainland China'])
    const [secondaryGraph, setSecondaryGraph] = useState('Deaths')

    const availableCountries = COUNTRIES

    const confirmed = useSelector(state => state.services.global.confirmed)
    const recovered = useSelector(state => state.services.global.recovered)
    const deaths = useSelector(state => state.services.global.deaths)
    const mortality = useSelector(state => state.services.global.mortality)
    const recovery = useSelector(state => state.services.global.recovery)

    const [confirmedTotal, setConfirmedTotal] = useState(0)
    const [totalCountries, setTotalCountries] = useState(0)

    const COUNTRY_COUNT = Object.keys(COUNTRIES).length - 2

    /**
     * Fetch all the data
     */
    useEffect(() => {
        dispatch(actions.fetchGlobal())

    }, [])

    // useEffect(() => {
    //     if(confirmed) {
    //         const totalGlobal = Object.values(confirmed['!Global'])
    //         setConfirmedTotal(totalGlobal[totalGlobal.length - 1])

    //         let confirmedCountries = 0
    //         for(const country of Object.keys(confirmed)) {
    //             const total = Object.values(confirmed[country]).reduce((total, value) => total + value)
                
    //             if(total > 0 && country !== '!Global' && country !== '!Outside Mainland China') {
    //                 ++confirmedCountries
    //             }
    //         }
    //         setTotalCountries(confirmedCountries)
    //     }
    // }, [confirmed])

    return (
        <>
        <h1>Global</h1>

        <Table fullwidth>
            <Table.Head>
                <Table.Row>
                    <Table.Heading>
                        Region
                    </Table.Heading>
                    <Table.Heading>
                        Confirmed
                    </Table.Heading>
                    <Table.Heading>
                        Deceased
                    </Table.Heading>
                    <Table.Heading>
                        Recovered
                    </Table.Heading>
                    <Table.Heading>
                        Mortality Rate
                    </Table.Heading>
                    <Table.Heading>
                        Recovery Rate
                    </Table.Heading>
                </Table.Row>
            </Table.Head>
            <Table.Body>
                <Table.Row>
                    <Table.Cell>
                        Mainland China
                    </Table.Cell>
                    <Table.Cell>
                    </Table.Cell>
                    <Table.Cell>
                    </Table.Cell>
                    <Table.Cell>
                    </Table.Cell>
                </Table.Row>
            </Table.Body>
        </Table>
        </>
    )    
}

export default StatsContainer