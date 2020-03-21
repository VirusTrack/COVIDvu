import React, { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { useHistory, useLocation } from 'react-router'

import { useWindowSize, useInterval } from '../hooks/ui'

import queryString from 'query-string'

import { actions } from '../ducks/services'

import { Tab } from "rbx"

import TwoGraphLayout from '../layouts/TwoGraphLayout'

import GraphWithLoader from '../components/GraphWithLoader'

import { CACHE_INVALIDATE_GLOBAL_KEY, ONE_MINUTE } from '../constants'

import store from 'store2'

import SelectRegionComponent from '../components/SelectRegionComponent'
import HeroElement from '../components/HeroElement'
import BoxWithLoadingIndicator from '../components/BoxWithLoadingIndicator'

export const ContinentalGraphContainer = ({region = ['North America', 'Europe', 'Asia'], graph = 'Cases'}) => {

    const dispatch = useDispatch()
    const history = useHistory()
    const { search } = useLocation()

    const [width, height] = useWindowSize()

    const [selectedContinents, setSelectedContinents] = useState(region)
    const [secondaryGraph, setSecondaryGraph] = useState(graph)
    
    const confirmed = useSelector(state => state.services.continental.confirmed)
    const sortedConfirmed = useSelector(state => state.services.continental.sortedConfirmed)
    const deaths = useSelector(state => state.services.continental.deaths)
    const mortality = useSelector(state => state.services.continental.mortality)

    /**
     * Fetch all the data
     */
    useEffect(() => {
        dispatch(actions.fetchContinental())
    }, [dispatch])


    useInterval(() => {
        if(store.get(CACHE_INVALIDATE_GLOBAL_KEY)) {
            dispatch(actions.fetchContinental())
        }
    }, ONE_MINUTE)

    useEffect(() => {
        if(!search) {
            handleHistory(selectedContinents, secondaryGraph)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleHistory = (region, graph) => {
        const query = queryString.stringify({
            region,
            graph
        })

        history.replace(`/covid/continental?${query}`)
    }

    const handleSelectedRegion = (regionList) => {
        setSelectedContinents(regionList)
        handleHistory(regionList, secondaryGraph)
    }

    const handleSelectedGraph = (selectedGraph) => {
        setSecondaryGraph(selectedGraph)
        handleHistory(selectedContinents, selectedGraph)
    }
    
    return (
    <>
        <HeroElement
            subtitle="Global"
            title={
                <>Coronavirus Cases <br />by Continent</>
            }
            buttons={[
                { title: 'Cases By Country', location: '/covid' },
                { title: 'Cases By Continent', location: '/covid/continental' },
            ]}
        />
        <BoxWithLoadingIndicator hasData={sortedConfirmed}>
            <TwoGraphLayout>

                <SelectRegionComponent
                    data={sortedConfirmed}
                    selected={selectedContinents}
                    handleSelected={dataList => handleSelectedRegion(dataList)} />
                    
                <>
                    <Tab.Group size="large" kind="boxed">
                        <Tab active={secondaryGraph === 'Cases'} onClick={() => { handleSelectedGraph('Cases')}}>Cases</Tab>
                        <Tab active={secondaryGraph === 'Deaths'} onClick={() => { handleSelectedGraph('Deaths')}}>Deaths</Tab>
                        <Tab active={secondaryGraph === 'Mortality'} onClick={() => { handleSelectedGraph('Mortality')}}>Mortality</Tab>
                    </Tab.Group>

                    <GraphWithLoader 
                        graphName="Cases"
                        secondaryGraph={secondaryGraph}
                        graph={confirmed}
                        width={width}
                        height={height}
                        selected={selectedContinents}
                        y_title="Total confirmed cases"
                    />

                    <GraphWithLoader 
                        graphName="Deaths"
                        secondaryGraph={secondaryGraph}
                        graph={deaths}
                        width={width}
                        height={height}
                        selected={selectedContinents}
                        y_title="Number of deaths"
                    />        

                    <GraphWithLoader 
                        graphName="Mortality"
                        secondaryGraph={secondaryGraph}
                        graph={mortality}
                        width={width}
                        height={height}
                        selected={selectedContinents}
                        y_type="percent"
                        y_title="Mortality Rate Percentage"
                    />
                </>

            </TwoGraphLayout>
        </BoxWithLoadingIndicator>
    </>
    )    
}

export default ContinentalGraphContainer