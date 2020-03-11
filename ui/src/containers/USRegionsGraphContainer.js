import React, { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { actions } from '../ducks/services'

import { Column, Tag, Message, Tab } from "rbx"

import ThreeGraphLayout from '../layouts/ThreeGraphLayout'

import { US_REGIONS } from '../constants'

import GraphWithLoader from '../components/GraphWithLoader'
import SelectRegionComponent from '../components/SelectRegionComponent'

export const USRegionsGraphContainer = () => {
    const dispatch = useDispatch()

    const [selectedRegions, setSelectedRegions] = useState(['!Total US'])

    const [secondaryGraph, setSecondaryGraph] = useState('Deaths')

    const availableRegions = US_REGIONS

    const confirmed = useSelector(state => state.services.usStates.confirmed)
    const recovered = useSelector(state => state.services.usStates.recovered)
    const deaths = useSelector(state => state.services.usStates.deaths)
    const mortality = useSelector(state => state.services.usStates.mortality)
    const recovery = useSelector(state => state.services.usStates.recovery)

    const [confirmedTotal, setConfirmedTotal] = useState(0)

    useEffect(() => {
        dispatch(actions.fetchUSRegions())
    }, [])

    useEffect(() => {
        if(confirmed) {
            const totalRegions = Object.values(confirmed['!Total US'])
            setConfirmedTotal(totalRegions[totalRegions.length - 1])
        }
    }, [confirmed])    

    return (
        <ThreeGraphLayout>
            <>                        
                    
                <Tag size="large" color="danger">Total Cases: {confirmedTotal}</Tag><br />

                <SelectRegionComponent
                    data={availableRegions}
                    selected={selectedRegions}
                    handleSelected={(dataList) => {
                        setSelectedRegions(dataList)
                    }} />

            </>

            <GraphWithLoader 
                graphName="Confirmed"
                secondaryGraph="Confirmed"
                title="Cases US Regions"
                graph={confirmed}
                selected={selectedRegions}
                y_title="Total confirmed cases"
                config={
                    {
                        displayModeBar: false
                    }
                }
            />
            
            <>
                <Tab.Group>
                    <Tab active={secondaryGraph === 'Deaths'} onClick={() => { setSecondaryGraph('Deaths')}}>Deaths</Tab>
                    <Tab active={secondaryGraph === 'Recovered'} onClick={() => { setSecondaryGraph('Recovered')}}>Recovered</Tab>
                    <Tab active={secondaryGraph === 'Mortality'} onClick={() => { setSecondaryGraph('Mortality')}}>Mortality</Tab>
                    <Tab active={secondaryGraph === 'Recovery'} onClick={() => { setSecondaryGraph('Recovery')}}>Recovery</Tab>
                </Tab.Group>

                <GraphWithLoader 
                    graphName="Deaths"
                    secondaryGraph={secondaryGraph}
                    graph={deaths}
                    selected={selectedRegions}
                    y_title="Number of deaths"
                    config={
                        {
                            displayModeBar: false,
                            showlegend: true
                        }
                    }
                />

                <GraphWithLoader 
                    graphName="Recovered"
                    secondaryGraph={secondaryGraph}
                    graph={recovered}
                    selected={selectedRegions}
                    y_title='Number of recovered'
                    config={
                        {
                            displayModeBar: false,
                            showlegend: true
                        }
                    }
                />

                <GraphWithLoader 
                    graphName="Mortality"
                    secondaryGraph={secondaryGraph}
                    graph={mortality}
                    selected={selectedRegions}
                    y_type='percent'
                    y_title='Mortality Rate Percentage'
                    config={
                        {
                            displayModeBar: false,
                            showlegend: true
                        }
                    }
                />


                <GraphWithLoader 
                    graphName="Recovery"
                    secondaryGraph={secondaryGraph}
                    graph={recovery}
                    selected={selectedRegions}
                    y_type='percent'
                    y_title='Recovery Rate Percentage'
                    config={
                        {
                            displayModeBar: false,
                            showlegend: true
                        }
                    }
                />
            </>

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
        </ThreeGraphLayout>

    )
}

export default USRegionsGraphContainer