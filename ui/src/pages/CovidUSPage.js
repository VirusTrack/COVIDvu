import React, { useEffect, useState } from 'react'

// import { useLocation, useHistory } from 'react-router'

import { Content, Select, Column, Tag } from "rbx"


import { HeaderContainer } from '../containers/HeaderContainer'
import { FooterContainer } from '../containers/FooterContainer'

import Graph from '../components/Graph'

// import queryString from 'query-string'

import { US_STATES, DATA_URL } from '../constants'

import axios from 'axios'

import numeral from 'numeral'
// import store from 'store'

export const CovidUSPage = () => {

    // const location = useLocation()

    const [selectedStates, setSelectedStates] = useState(['!Total US'])

    const availableStates = US_STATES

    const [confirmedUS, setConfirmedUS] = useState(null)
    const [recoveredUS, setRecoveredUS] = useState(null)
    const [deathsUS, setDeathsUS] = useState(null)

    const [confirmedTotal, setConfirmedTotal] = useState(0)

    const onChangeStates = (event) => {
        const options = event.target.options

        let stateList = []
        for(const option of options) {
            if(option.selected) {
                stateList.push(option.value)
            }
        }
        // history.replace(`/covid?${queryString.stringify({ country: countryList })}`)
        setSelectedStates(stateList)
    }

    useEffect(() => {
        axios.get(`${DATA_URL}/confirmed-US.json`).then(response => {
            const confirmed = response.data
            setConfirmedUS(confirmed)

            const totalUS = Object.values(confirmed['!Total US'])
            setConfirmedTotal(totalUS[totalUS.length - 1])
        })
    }, [])

    useEffect(() => {
        axios.get(`${DATA_URL}/deaths-US.json`).then(response => {
            setDeathsUS(response.data)
        })
    }, [])

    useEffect(() => {
        axios.get(`${DATA_URL}/recovered-US.json`).then(response => {
            setRecoveredUS(response.data)
        })
    }, [])

    return (
        <div>
            <HeaderContainer />

            <Content style={{margin: '0.5rem'}}>
                <Column.Group breakpoint="mobile">
                        <Column>
                        
                        <Tag size="large" color="danger">Total Cases: {numeral(confirmedTotal).format('0,0')}</Tag><br />
    
                        <Select.Container style={{marginTop: '0.5rem'}}>
                            <Select multiple size={10} value={selectedStates} onChange={onChangeStates}>
                                {availableStates.map(state => (
                                    <Select.Option key={state} value={state}>{state}</Select.Option>
                                ))}
                            </Select>
                        </Select.Container>

                        </Column>

                        <Column>                        
                            { confirmedUS ? (
                            <Graph title='Cases by State'
                                data={confirmedUS} 
                                selected={selectedStates}
                                />
                            ) : (
                                <div>
                                    Loading...
                                </div>
                            )}
                        </Column>

                        <Column>                        
                            { deathsUS ? (
                            <Graph title='Deaths by State'
                                data={deathsUS} 
                                selected={selectedStates}
                                />
                            ) : (
                                <div>
                                    Loading...
                                </div>
                            )}
                        </Column>
                        
                        <Column>
                        
                        { recoveredUS ? (
                            <Graph title='Recovered by State'
                                data={recoveredUS} 
                                selected={selectedStates}
                                />
                            ) : (
                                <div>
                                    Loading...
                                </div>
                            )}  

                        </Column>

                </Column.Group>
            </Content>
            
            <FooterContainer />
        </div>
    )
}

export default CovidUSPage