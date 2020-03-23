import React, { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { useHistory, useLocation } from 'react-router'

import { useInterval } from '../hooks/ui'

import queryString from 'query-string'

import { actions } from '../ducks/services'

import { Tab } from "rbx"

import TwoGraphLayout from '../layouts/TwoGraphLayout'

import GraphWithLoader from '../components/GraphWithLoader'

import { CACHE_INVALIDATE_GLOBAL_KEY, ONE_MINUTE } from '../constants'

import store from 'store2'

import GraphScaleControl from '../components/GraphScaleControl'
import CheckboxRegionComponent from '../components/CheckboxRegionComponent'
import HeroElement from '../components/HeroElement'
import BoxWithLoadingIndicator from '../components/BoxWithLoadingIndicator'

export const ContinentalGraphContainer = ({region = ['North America', 'Europe', 'Asia'], graph = 'Cases', showLogParam = false}) => {

    const dispatch = useDispatch()
    const history = useHistory()
    const { search } = useLocation()

    const [showLog, setShowLog] = useState(showLogParam)
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

    const handleHistory = (region, graph, showLog) => {
        const query = queryString.stringify({
            region,
            graph,
            showLog
        })

        history.replace(`/covid/continental?${query}`)
    }

    const handleSelectedRegion = (regionList) => {
        setSelectedContinents(regionList)
        handleHistory(regionList, secondaryGraph, showLog)
    }

    const handleSelectedGraph = (selectedGraph) => {
        setSecondaryGraph(selectedGraph)
        handleHistory(selectedContinents, selectedGraph, showLog)
    }
    
    const handleGraphScale = (logScale) => {
        setShowLog(logScale)
        handleHistory(selectedContinents, secondaryGraph, logScale)
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

                <CheckboxRegionComponent
                    data={sortedConfirmed}
                    selected={selectedContinents}
                    handleSelected={dataList => handleSelectedRegion(dataList)} 
                    defaultSelected={region}
                    showLog={showLog}
                />
                    
                <>
                    <Tab.Group size="large" kind="boxed">
                        <Tab active={secondaryGraph === 'Cases'} onClick={() => { handleSelectedGraph('Cases')}}>Cases</Tab>
                        <Tab active={secondaryGraph === 'Deaths'} onClick={() => { handleSelectedGraph('Deaths')}}>Deaths</Tab>
                        <Tab active={secondaryGraph === 'Mortality'} onClick={() => { handleSelectedGraph('Mortality')}}>Mortality</Tab>
                    </Tab.Group>

                    <GraphScaleControl
                        showLog={showLog}
                        handleGraphScale={handleGraphScale}
                        secondaryGraph={secondaryGraph}
                    />

                    <GraphWithLoader 
                        graphName="Cases"
                        secondaryGraph={secondaryGraph}
                        graph={confirmed}
                        selected={selectedContinents}
                        showLog={showLog}
                        y_title="Total confirmed cases"
                    />

                    <GraphWithLoader 
                        graphName="Deaths"
                        secondaryGraph={secondaryGraph}
                        graph={deaths}
                        selected={selectedContinents}
                        showLog={showLog}
                        y_title="Number of deaths"
                    />        

                    <GraphWithLoader 
                        graphName="Mortality"
                        secondaryGraph={secondaryGraph}
                        graph={mortality}
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