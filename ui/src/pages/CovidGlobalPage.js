import React, { useEffect, useState } from 'react'

// import { useLocation, useHistory } from 'react-router'

import { Content, Select, Column, Tag, Tab } from "rbx"

import { HeaderContainer } from '../containers/HeaderContainer'
import { FooterContainer } from '../containers/FooterContainer'

// import queryString from 'query-string'

import Graph from '../components/Graph'

// import moment from 'moment'
import axios from 'axios'

import { COUNTRIES, DATA_URL } from '../constants'

import store from 'store'
import numeral from 'numeral'

export const CovidGlobalPage = () => {

    // const location = useLocation()
    // const history = useHistory()

    // const query = queryString.parse(location.search.indexOf('?') !== -1 ? location.search : location.search.substring(1))
    const [selectedCountries, setSelectedCountries] = useState(['!Global', '!Outside Mainland China'])

    const [secondaryGraph, setSecondaryGraph] = useState('Deaths')

    const availableCountries = COUNTRIES

    const [confirmed, setConfirmed] = useState(null)
    const [recovered, setRecovered] = useState(null)
    const [deaths, setDeaths] = useState(null)
    const [mortality, setMortality] = useState(null)
    const [recovery, setRecovery] = useState(null)

    const [confirmedTotal, setConfirmedTotal] = useState(0)

    // useEffect(() => {
    //     if(query.country) {
    //         setSelectedCountries(query.country)
    //     } else {
    //         setSelectedCountries(['US', 'UK'])
    //     }    
    // }, [query])

    const onChangeCountries = (event) => {
        const options = event.target.options

        let countryList = []
        for(const option of options) {
            if(option.selected) {
                countryList.push(option.value)
            }
        }
        // history.replace(`/covid?${queryString.stringify({ country: countryList })}`)
        setSelectedCountries(countryList)        
    }

    // TODO write a custom hook which will grab from head and compare against a stored last modified for a given resource and if > stored, grab new data and store saved.
    // TODO should also look at when page is loaded, just showing the default data, as long as we have both last_modified AND data
    useEffect(() => {
        // axios.head(`${DATA_URL}/confirmed.json`).then(response => {
        //     const last_modified_as_number = moment(response.headers['last-modified']).valueOf()
        //     store.set('confirmed_last_modified', last_modified_as_number)  
        // })

        axios.get(`${DATA_URL}/confirmed.json`).then(response => {
            const confirmed = response.data
            setConfirmed(confirmed)

            const totalGlobal = Object.values(confirmed['!Global'])
            setConfirmedTotal(totalGlobal[totalGlobal.length - 1])

        })
    }, [])


    useEffect(() => {
        // mortality = deaths / confirmed
        if(deaths !== null && confirmed !== null && recovered !== null) {
        
            let mortality = {}
            let recovery = {}

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

            setMortality(mortality)
            setRecovery(recovery)
        }
    }, [deaths, confirmed, recovered])

    useEffect(() => {
        axios.get(`${DATA_URL}/deaths.json`).then(response => {
            setDeaths(response.data)
        })
    }, [])

    useEffect(() => {
        const recovered_url = `${DATA_URL}/recovered.json`
        axios.get(recovered_url).then(response => {
            setRecovered(response.data)
        })
    }, [])

    return (
        <div >
            <HeaderContainer />

            <Content style={{margin: '0.5rem'}}>
                <Column.Group breakpoint="mobile">

                        <Column>
                        
                        <Tag size="large" color="danger">Total Cases: {numeral(confirmedTotal).format('0,0')}</Tag><br />

                        <Select.Container style={{marginTop: '0.5rem'}}>
                        <Select multiple size={10} value={selectedCountries} onChange={onChangeCountries}>
                            {availableCountries.map(country => (
                                <Select.Option key={country} value={country}>{country}</Select.Option>
                            ))}
                        </Select>
                        </Select.Container>

                        </Column>
                        <Column>
                        
                            { confirmed ? (
                            <Graph title='Cases'
                                data={confirmed}
                                selected={selectedCountries} 
                                config={
                                    {
                                        displayModeBar: false,
                                        showlegend: true,

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
                                { deaths ? (
                                <Graph title={null}
                                    data={deaths}
                                    selected={selectedCountries} 
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
                                { recovered ? (
                                <Graph title={null}
                                    data={recovered}
                                    selected={selectedCountries} 
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
                                { mortality ? (
                                <Graph title={null}
                                    data={mortality}
                                    selected={selectedCountries}
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
                                { recovery ? (
                                <Graph title={null}
                                    data={recovery}
                                    selected={selectedCountries}
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

export default CovidGlobalPage