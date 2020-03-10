import React, { useEffect, useState } from 'react'

// import { useLocation, useHistory } from 'react-router'

import { Content, Select, Column, Tag, Tab } from "rbx"


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

    const [secondaryGraph, setSecondaryGraph] = useState('Deaths')

    const availableStates = US_STATES

    const [confirmedUS, setConfirmedUS] = useState(null)
    const [recoveredUS, setRecoveredUS] = useState(null)
    const [deathsUS, setDeathsUS] = useState(null)
    const [mortalityUS, setMortalityUS] = useState(null)
    const [recoveryUS, setRecoveryUS] = useState(null)

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
        if(deathsUS !== null && confirmedUS !== null && recoveredUS !== null) {
        
            let mortality = {}
            let recovery = {}

            Object.keys(deathsUS).map(country => {
                Object.keys(deathsUS[country]).map(date => {
                    let deathAtDate = deathsUS[country][date]
                    let confirmedAtDate = confirmedUS[country][date]
                    let recoveredAtDate = recoveredUS[country][date]

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

            setMortalityUS(mortality)
            setRecoveryUS(recovery)
        }

    }, [deathsUS, confirmedUS, recoveredUS])

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
                                x_title='Dates'
                                config={
                                    {
                                        displayModeBar: false
                                    }}
                                />
                            ) : (
                                <div>
                                    Loading...
                                </div>
                            )}
                        </Column>

                        <Column>


                        <Tab.Group>
                                <Tab active={secondaryGraph === 'Deaths'} onClick={() => { setSecondaryGraph('Deaths')}}>Deaths</Tab>
                                <Tab active={secondaryGraph === 'Recovered'} onClick={() => { setSecondaryGraph('Recovered')}}>Recovered</Tab>
                                <Tab active={secondaryGraph === 'Mortality'} onClick={() => { setSecondaryGraph('Mortality')}}>Mortality</Tab>
                                <Tab active={secondaryGraph === 'Recovery'} onClick={() => { setSecondaryGraph('Recovery')}}>Recovery</Tab>
                            </Tab.Group>

                            { secondaryGraph === 'Deaths' &&
                            <React.Fragment>
                                { deathsUS ? (
                                <Graph title={null}
                                    data={deathsUS}
                                    selected={selectedStates} 
                                    config={
                                        {
                                            displayModeBar: false,
                                            showlegend: true
                                        }}
                                    />
                                ) : (
                                    <div>
                                        Loading...
                                    </div>
                                )}
                            </React.Fragment>
                            }                            
                            { secondaryGraph === 'Recovered' &&
                            <React.Fragment>
                                { recoveredUS ? (
                                <Graph title={null}
                                    data={recoveredUS}
                                    selected={selectedStates} 
                                    config={{displayModeBar: false}}
                                    />
                                ) : (
                                    <div>
                                        Loading...
                                    </div>
                                )}
                            </React.Fragment>  
                            }
                            { secondaryGraph === 'Mortality' &&
                            <React.Fragment>
                                { mortalityUS ? (
                                <Graph title={null}
                                    data={mortalityUS}
                                    selected={selectedStates} 
                                    y_type='percent'
                                    y_title='Percent'
                                    config={{displayModeBar: false}}
                                    />
                                ) : (
                                    <div>
                                        Loading...
                                    </div>
                                )}
                            </React.Fragment>  
                            }
                            { secondaryGraph === 'Recovery' &&
                            <React.Fragment>
                                { recoveryUS ? (
                                <Graph title={null}
                                    data={recoveryUS}
                                    selected={selectedStates} 
                                    y_type='percent'
                                    y_title='Percent'
                                    config={{displayModeBar: false}}
                                    />
                                ) : (
                                    <div>
                                        Loading...
                                    </div>
                                )}
                            </React.Fragment>  
                            }

                        </Column>

                </Column.Group>
            </Content>
            
            <FooterContainer />
        </div>
    )
}

export default CovidUSPage