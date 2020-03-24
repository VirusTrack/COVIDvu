import React, { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { useHistory, useLocation } from 'react-router'

import { useInterval } from '../hooks/ui'

import queryString from 'query-string'

import { actions } from '../ducks/services'

import { Tag, Tab, Level } from "rbx"

import { COUNTRIES, CACHE_INVALIDATE_GLOBAL_KEY, ONE_MINUTE } from '../constants'
import numeral from 'numeral'
import store from 'store2'

import TwoGraphLayout from '../layouts/TwoGraphLayout'
import GraphWithLoader from '../components/GraphWithLoader'

import GraphScaleControl from '../components/GraphScaleControl'
import CheckboxRegionComponent from '../components/CheckboxRegionComponent'
import HeroElement from '../components/HeroElement'
import BoxWithLoadingIndicator from '../components/BoxWithLoadingIndicator'

export const GlobalGraphContainer = ({region = [], graph = 'Cases', showLogParam = false}) => {

    const dispatch = useDispatch()
    const history = useHistory()
    const { search } = useLocation()

    const [showLog, setShowLog] = useState(showLogParam)
    const [selectedCountries, setSelectedCountries] = useState(region)
    const [secondaryGraph, setSecondaryGraph] = useState(graph)
    
    const confirmed = useSelector(state => state.services.global.confirmed)
    const sortedConfirmed = useSelector(state => state.services.global.sortedConfirmed)
    const deaths = useSelector(state => state.services.global.deaths)
    const mortality = useSelector(state => state.services.global.mortality)

    const [confirmedTotal, setConfirmedTotal] = useState(0)
    const [totalCountries, setTotalCountries] = useState(0)

    const COUNTRY_COUNT = Object.keys(COUNTRIES).length - 2

    /**
     * Fetch all the data
     */
    useEffect(() => {
        dispatch(actions.fetchGlobal())
    }, [dispatch, showLog])


    useInterval(() => {
        if(store.session.get(CACHE_INVALIDATE_GLOBAL_KEY)) {
            dispatch(actions.fetchGlobal({showLog}))
        }
    }, ONE_MINUTE)

    // Select the Top 3 confirmed from list if nothing is selected
    useEffect(() => {
        if(sortedConfirmed && region.length === 0) {
            setSelectedCountries(sortedConfirmed.slice(0, 3).map(confirmed => confirmed.region))
        }
    }, [sortedConfirmed])

    useEffect(() => {
        if(!search) {
            handleHistory(selectedCountries, secondaryGraph)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    const renderCaseTags = () => {        
        if(selectedCountries.indexOf('!Global') !== -1) {
            return (
                <Tag size="large" color="danger">Total Cases: {numeral(confirmedTotal).format('0,0')}</Tag>
            )
        } else {
            return (
                <Tag size="large" color="danger">Selected Cases: {numeral(confirmedTotal).format('0,0')}</Tag>
            )
        }
    }

    const handleHistory = (region, graph, showLog) => {
        const query = queryString.stringify({
            region,
            graph,
            showLog
        })

        history.replace(`/covid?${query}`)
    }

    useEffect(() => {
        if(confirmed) {

            let theConfirmedTotal = 0

            for(let confirm of sortedConfirmed) {
                if(confirm.region === '!Global') {
                    theConfirmedTotal += confirm.stats
                }
            }
            setConfirmedTotal(theConfirmedTotal)

            let confirmedCountries = 0
            for(const country of Object.keys(confirmed)) {
                const total = Object.values(confirmed[country]).reduce((total, value) => total + value)
                
                if(total > 0 && country !== '!Global' && country !== '!Outside Mainland China') {
                    ++confirmedCountries
                }
            }
            setTotalCountries(confirmedCountries)
        }
    }, [confirmed, selectedCountries, sortedConfirmed])

    const handleSelectedRegion = (regionList) => {
        setSelectedCountries(regionList)
        handleHistory(regionList, secondaryGraph, showLog)
    }

    const handleSelectedGraph = (selectedGraph) => {
        setSecondaryGraph(selectedGraph)
        handleHistory(selectedCountries, selectedGraph, showLog)
    }    

    const handleGraphScale = (logScale) => {
        setShowLog(logScale)
        handleHistory(selectedCountries, secondaryGraph, logScale)
    }

    return (
        <>
        <HeroElement
            subtitle="Global"
            title={
                <>Coronavirus Cases <br />by Country</>
            }
            buttons={[
                { title: 'Cases By Country', location: '/covid' },
                { title: 'Cases By Continent', location: '/covid/continental' },
            ]}
        />

        <BoxWithLoadingIndicator hasData={sortedConfirmed}>
            <TwoGraphLayout>

                <>
                    <CheckboxRegionComponent
                        data={sortedConfirmed}
                        selected={selectedCountries}
                        handleSelected={dataList => handleSelectedRegion(dataList)} 
                        defaultSelected={region}
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
                        selected={selectedCountries}
                        showLog={showLog}
                        y_title="Total confirmed cases"
                    />

                    <GraphWithLoader 
                        graphName="Deaths"
                        secondaryGraph={secondaryGraph}
                        graph={deaths}
                        selected={selectedCountries}
                        showLog={showLog}
                        y_title="Number of deaths"
                    />        

                    <GraphWithLoader 
                        graphName="Mortality"
                        secondaryGraph={secondaryGraph}
                        graph={mortality}
                        selected={selectedCountries}
                        y_type="percent"
                        y_title="Mortality Rate Percentage"
                    />
            
                </>

                <>
                    <Level>
                        <Level.Item>
                            {!showLog && renderCaseTags()}
                        </Level.Item>
                    </Level>

                    <Level>
                        <Level.Item>
                            <Tag size="large" color="info">Countries: {totalCountries} / { COUNTRY_COUNT }</Tag><br /><br />
                        </Level.Item>
                    </Level>
                </>

            </TwoGraphLayout>
        </BoxWithLoadingIndicator>

        </>
    )    
}

export default GlobalGraphContainer