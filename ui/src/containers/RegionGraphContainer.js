import React, { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { useHistory, useLocation } from 'react-router'

import queryString from 'query-string'

import { actions } from '../ducks/services'

import { Tab, Message } from "rbx"

import TwoGraphLayout from '../layouts/TwoGraphLayout'
import GraphWithLoader from '../components/GraphWithLoader'

import GraphScaleControl from '../components/GraphScaleControl'
import CheckboxRegionComponent from '../components/CheckboxRegionComponent'
import HeroElement from '../components/HeroElement'
import BoxWithLoadingIndicator from '../components/BoxWithLoadingIndicator'

const countriesRegions = require('../constants/countries_regions.json');

export const RegionGraphContainer = ({region, uniqueRegion = [], graph = 'Cases', showLogParam = false}) => {

    const dispatch = useDispatch()
    const history = useHistory()
    const { search } = useLocation()

    const [showLog, setShowLog] = useState(showLogParam)
    const [selectedRegions, setSelectedRegions] = useState(uniqueRegion)
    const [secondaryGraph, setSecondaryGraph] = useState(graph)
    
    // TODO look into using the hook for this as well, somehow
    const confirmed = useSelector(state => state.services.region.hasOwnProperty(region) ? state.services.region[region].confirmed : undefined)
    const sortedConfirmed = useSelector(state => state.services.region.hasOwnProperty(region) ? state.services.region[region].sortedConfirmed : undefined)
    const deaths = useSelector(state => state.services.region.hasOwnProperty(region) ? state.services.region[region].deaths : undefined)
    const mortality = useSelector(state => state.services.region.hasOwnProperty(region) ? state.services.region[region].mortality : undefined)

    const [regionNotFound, setRegionNotFound] = useState(undefined)

    /**
     * Fetch all the data
     */
    useEffect(() => {
        const uniqueRegionSet = Object.values(countriesRegions).filter((value, index, self) => self.indexOf(value) === index)

        if(uniqueRegionSet.indexOf(region) !== -1) {
            dispatch(actions.fetchRegion({region}))
        } else {
            setRegionNotFound(true)
        }
    }, [dispatch, region, showLog])

    const handleHistory = (regions, graph, showLog) => {
        const query = queryString.stringify({
            region: regions,
            graph,
            showLog
        })

        history.replace(`/covid/region/${region}?${query}`)
    }

    // Select the Top 3 confirmed from list if nothing is selected
    useEffect(() => {
        if(sortedConfirmed && uniqueRegion.length === 0) {
            setSelectedRegions(sortedConfirmed.slice(0, 3).map(confirmed => confirmed.region))
        }
    }, [sortedConfirmed])

    const handleSelectedRegion = (regionList) => {
        setSelectedRegions(regionList)
        handleHistory(regionList, secondaryGraph, showLog)
    }

    const handleSelectedGraph = (selectedGraph) => {
        setSecondaryGraph(selectedGraph)
        handleHistory(selectedRegions, selectedGraph, showLog)
    }    

    const handleGraphScale = (logScale) => {
        setShowLog(logScale)
        handleHistory(selectedRegions, secondaryGraph, logScale)
    }

    if(regionNotFound) {
        return (
            <Message color="danger">
                <Message.Header>
                    Region not found
                </Message.Header>
                <Message.Body>
                    The region entered in the location bar was not found
                </Message.Body>
            </Message>
        )
    }

    return (
        <>
        <HeroElement
            subtitle={region}
            title={
                <>Coronavirus Cases <br />by Country</>
            }
        />

        <BoxWithLoadingIndicator hasData={sortedConfirmed}>
            <TwoGraphLayout>

                <>
                    <CheckboxRegionComponent
                        data={sortedConfirmed}
                        selected={selectedRegions}
                        handleSelected={dataList => handleSelectedRegion(dataList)} 
                        defaultSelected={uniqueRegion}
                        showLog={showLog}
                    />

                </>

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
                        selected={selectedRegions}
                        showLog={showLog}
                        y_title="Total confirmed cases"
                    />

                    <GraphWithLoader 
                        graphName="Deaths"
                        secondaryGraph={secondaryGraph}
                        graph={deaths}
                        selected={selectedRegions}
                        showLog={showLog}
                        y_title="Number of deaths"
                    />        

                    <GraphWithLoader 
                        graphName="Mortality"
                        secondaryGraph={secondaryGraph}
                        graph={mortality}
                        selected={selectedRegions}
                        y_type="percent"
                        y_title="Mortality Rate Percentage"
                    />
            
                </>

            </TwoGraphLayout>
        </BoxWithLoadingIndicator>

        </>
    )    
}

export default RegionGraphContainer