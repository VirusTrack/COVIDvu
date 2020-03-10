import React, { useEffect, useState } from 'react'

// import { useLocation, useHistory } from 'react-router'

import { Content, Select, Column, Tag, Message, Tab } from "rbx"


import { HeaderContainer } from '../containers/HeaderContainer'
import { FooterContainer } from '../containers/FooterContainer'

// import queryString from 'query-string'

import { US_REGIONS, DATA_URL } from '../constants'

import axios from 'axios'

import Graph from '../components/Graph'

export const CovidUSRegionsPage = () => {

    // const location = useLocation()
    const [selectedRegions, setSelectedRegions] = useState(['!Total US'])

    const [secondaryGraph, setSecondaryGraph] = useState('Deaths')

    const availableRegions = US_REGIONS

    const [confirmedUSRegions, setConfirmedUSRegions] = useState(null)
    const [recoveredUSRegions, setRecoveredUSRegions] = useState(null)
    const [deathsUSRegions, setDeathsUSRegions] = useState(null)
    const [mortalityUSRegions, setMortalityUSRegions] = useState(null)
    const [recoveryUSRegions, setRecoveryUSRegions] = useState(null)

    const [confirmedTotal, setConfirmedTotal] = useState(0)

    const onChangeRegions = (event) => {
        const options = event.target.options

        let regionList = []
        for(const option of options) {
            if(option.selected) {
                regionList.push(option.value)
            }
        }
        setSelectedRegions(regionList)
    }

    useEffect(() => {
        axios.get(`${DATA_URL}/confirmed-US-Regions.json`).then(response => {
            const confirmed = response.data

            setConfirmedUSRegions(confirmed)

            const totalUS = Object.values(confirmed['!Total US'])
            setConfirmedTotal(totalUS[totalUS.length - 1])

        })
    }, [])

    useEffect(() => {
        // mortality = deaths / confirmed
        if(deathsUSRegions !== null && confirmedUSRegions !== null && recoveredUSRegions !== null) {
        
            let mortalityUSRegions = {}
            let recoveryUSRegions = {}

            Object.keys(deathsUSRegions).map(country => {
                Object.keys(deathsUSRegions[country]).map(date => {
                    let deathAtDate = deathsUSRegions[country][date]
                    let confirmedAtDate = confirmedUSRegions[country][date]
                    let recoveredAtDate = recoveredUSRegions[country][date]

                    if(!mortalityUSRegions.hasOwnProperty(country)) {
                        mortalityUSRegions[country] = {}
                    }
                    if(!recoveryUSRegions.hasOwnProperty(country)) {
                        recoveryUSRegions[country] = {}
                    }
                    mortalityUSRegions[country][date] = deathAtDate / confirmedAtDate
                    recoveryUSRegions[country][date] = recoveredAtDate / confirmedAtDate
                })
            })

            setMortalityUSRegions(mortalityUSRegions)
            setRecoveryUSRegions(recoveryUSRegions)
        }
    }, [deathsUSRegions, confirmedUSRegions, recoveredUSRegions])

    useEffect(() => {
        axios.get(`${DATA_URL}/deaths-US-Regions.json`).then(response => {
            setDeathsUSRegions(response.data)
        })
    }, [])

    useEffect(() => {
        axios.get(`${DATA_URL}/recovered-US-Regions.json`).then(response => {
            setRecoveredUSRegions(response.data)
        })
    }, [])


    return (
        <div>
            <HeaderContainer />

            <Content style={{margin: '0.5rem'}}>
                <Column.Group breakpoint="mobile">

                        <Column>
                        
                            <Tag size="large" color="danger">Total Cases: {confirmedTotal}</Tag><br />

                            <Select.Container style={{marginTop: '0.5rem'}}>
                            <Select multiple size={10} value={selectedRegions} onChange={onChangeRegions}>
                                {availableRegions.map(region => (
                                    <Select.Option key={region} value={region}>{region}</Select.Option>
                                ))}
                            </Select>
                            </Select.Container>

                        </Column>

                        <Column>
                            { confirmedUSRegions ? (
                            <Graph title='Cases US Regions'
                                data={confirmedUSRegions} 
                                selected={selectedRegions}
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
                                { deathsUSRegions ? (
                                <Graph title={null}
                                    data={deathsUSRegions}
                                    selected={selectedRegions} 
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
                                { recoveredUSRegions ? (
                                <Graph title={null}
                                    data={recoveredUSRegions}
                                    selected={selectedRegions} 
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
                                { mortalityUSRegions ? (
                                <Graph title={null}
                                    data={mortalityUSRegions}
                                    selected={selectedRegions} 
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
                                { recoveryUSRegions ? (
                                <Graph title={null}
                                    data={recoveryUSRegions}
                                    selected={selectedRegions} 
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
                <Column.Group centered breakpoint="mobile">
                    <Column size="half">
                    <Message size="small" style={{margin: '0.5rem'}} color="link">
                                <Message.Body>
                                    <p>
                                        Northeast - CT, MA, ME, NH, NJ, NY, PA, RI, VT
                                    </p>
                                    <p>
                                        Midwest - IA, IL, IN, KS, MI, MN, MO, ND, NE, OH, SD, WI
                                    </p>
                                    <p>
                                        South - AL, AR, DC, DE, FL, GA, KY, LA, MD, MS, NC, OK, SC, TN, TX, VA, WV
                                    </p>
                                    <p>
                                        West - AK, AZ, CA, CO, HI, ID, MI, NM, NV, OR, UT, WA, WY
                                    </p>
                                </Message.Body>
                            </Message>                    
                    </Column>                
                </Column.Group>
            </Content>
            
            <FooterContainer />
        </div>
    )
}

export default CovidUSRegionsPage