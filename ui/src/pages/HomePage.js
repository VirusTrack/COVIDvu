import React, { useEffect, useState } from 'react'

import { Title, Section, Content, Select, Column } from "rbx"

import { FooterContainer } from '../containers/FooterContainer'

import Graph from '../components/Graph'

import axios from 'axios'
// const deaths = require ('../constants/deaths.json')
// const recovered = require ('../constants/recovered.json')
// const confirmed = require ('../constants/confirmed.json')

import COUNTRIES from '../constants/countries'

export const HomePage = () => {

    const [selectedCountries, setSelectedCountries] = useState(['US', 'UK'])

    const availableCountries = COUNTRIES

    const [confirmed, setConfirmed] = useState(null)
    const [recovered, setRecovered] = useState(null)
    const [deaths, setDeaths] = useState(null)

    const onChangeCountries = (event) => {
        const options = event.target.options

        let countryList = []
        for(const option of options) {
            if(option.selected) {
                countryList.push(option.value)
            }
        }
        setSelectedCountries(countryList)
    }

    useEffect(() => {
        axios.get('http://crispr4me.com/confirmed.json').then(response => {
            setConfirmed(response.data)
        })
    }, [])

    useEffect(() => {
        axios.get('http://crispr4me.com/deaths.json').then(response => {
            setDeaths(response.data)
        })
    }, [])

    useEffect(() => {
        axios.get('http://crispr4me.com/recovered.json').then(response => {
            setRecovered(response.data)
        })
    }, [])

    return (
        <div>

            <Section>
                <Content>
                    <Title>COVID-19 Graphs</Title>

                    <Column.Group>

                            <Column>
                            
                            <Select.Container>
                            <Select multiple size={5} value={selectedCountries} onChange={onChangeCountries}>
                                {availableCountries.map(country => (
                                    <Select.Option key={country} value={country}>{country}</Select.Option>
                                ))}
                            </Select>
                            </Select.Container>

                            </Column>
                        </Column.Group>
                        <Column.Group>
                            <Column>
                            
                                { confirmed ? (
                                <Graph title='Confirmed Cases'
                                    data={confirmed}
                                    selectedCountries={selectedCountries} />
                                ) : (
                                    <div>
                                        Loading...
                                    </div>
                                )}
                                
                            </Column>
                            <Column>
                            
                                { deaths ? (
                                <Graph title='Confirmed Deaths'
                                    data={deaths}
                                    selectedCountries={selectedCountries} />
                                ) : (
                                    <div>
                                        Loading...
                                    </div>
                                )}
                                
                            </Column>
                            <Column>
                            
                                { recovered ? (
                                <Graph title='Confirmed Recovered'
                                    data={recovered}
                                    selectedCountries={selectedCountries} />
                                ) : (
                                    <div>
                                        Loading...
                                    </div>
                                )}
                                
                            </Column>


                    </Column.Group>

                </Content>
            </Section>
            
            <FooterContainer />
        </div>
    )
}

export default HomePage