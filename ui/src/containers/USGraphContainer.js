import React, { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { actions } from '../ducks/services'

import { Tag, Tab } from "rbx"

import ThreeGraphLayout from '../layouts/ThreeGraphLayout'

import GraphWithLoader from '../components/GraphWithLoader'

import SelectRegionComponent from '../components/SelectRegionComponent'

import { US_STATES } from '../constants'

import numeral from 'numeral'

export const USGraphContainer = () => {

    const dispatch = useDispatch()

    const [selectedStates, setSelectedStates] = useState(['!Total US'])

    const [secondaryGraph, setSecondaryGraph] = useState('Deaths')

    const availableStates = US_STATES

    const confirmed = useSelector(state => state.services.usStates.confirmed)
    const recovered = useSelector(state => state.services.usStates.recovered)
    const deaths = useSelector(state => state.services.usStates.deaths)
    const mortality = useSelector(state => state.services.usStates.mortality)
    const recovery = useSelector(state => state.services.usStates.recovery)

    const [confirmedTotal, setConfirmedTotal] = useState(0)

    useEffect(() => {
        dispatch(actions.fetchUSStates())
    }, [])

    useEffect(() => {
        if(confirmed) {
            const totalStates = Object.values(confirmed['!Total US'])
            setConfirmedTotal(totalStates[totalStates.length - 1])
        }
    }, [confirmed])
    
    return (
        <ThreeGraphLayout>
            <>                        
                <Tag size="large" color="danger">Total Cases: {numeral(confirmedTotal).format('0,0')}</Tag><br />

                <SelectRegionComponent
                    data={availableStates}
                    selected={selectedStates}
                    handleSelected={(dataList) => {
                        setSelectedStates(dataList)
                    }} />

            </>

            <GraphWithLoader 
                graphName="Cases by State"
                secondaryGraph="Cases by State"
                graph={confirmed}
                selected={selectedStates}
                y_title="Total confirmed cases"
                config={
                    {
                        displayModeBar: false,
                        showlegend: true
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
                    selected={selectedStates}
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
                    selected={selectedStates}
                    y_title="Number of recovered"
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
                    selected={selectedStates}
                    y_type='percent'
                    y_title="Mortality Rate Percentage"
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
                    selected={selectedStates}
                    y_type='percent'
                    y_title="Recovery Rate Percentage"
                    config={
                        {
                            displayModeBar: false,
                            showlegend: true
                        }
                    }
                />              
            </>
        </ThreeGraphLayout>

    )
}

export default USGraphContainer