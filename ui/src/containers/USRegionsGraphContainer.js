import React, { useEffect, useState } from 'react'

import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router'

import { useHandleHistory } from '../hooks/nav'
import { useGraphData } from '../hooks/graphData'

import { actions } from '../ducks/services'

import { Tag, Notification, Level } from "rbx"

import TwoGraphLayout from '../layouts/TwoGraphLayout'
import TabbedCompareGraphs from '../components/TabbedCompareGraphs'

import CheckboxRegionComponent from '../components/CheckboxRegionComponent'
import HeroElement from '../components/HeroElement'
import BoxWithLoadingIndicator from '../components/BoxWithLoadingIndicator'

import ReactGA from 'react-ga';

export const USRegionsGraphContainer = ({region = [], graph = 'Cases', showLogParam = false}) => {
    const dispatch = useDispatch()
    const location = useLocation()
    const { search } = location
    const handleHistory = useHandleHistory('/covid/us/regions')

    const [showLog, setShowLog] = useState(showLogParam)
    const [selectedRegions, setSelectedRegions] = useState(region)
    const [secondaryGraph, setSecondaryGraph] = useState(graph)

    const { confirmed, sortedConfirmed, deaths, mortality } = useGraphData("usRegions")

    const [confirmedTotal, setConfirmedTotal] = useState(0)

    useEffect(() => {
        dispatch(actions.fetchUSRegions())
    }, [dispatch])

    // Select the Top 3 confirmed from list if nothing is selected
    useEffect(() => {
        if(sortedConfirmed && region.length === 0) {
            setSelectedRegions(sortedConfirmed.slice(0, 3).map(confirmed => confirmed.region))
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortedConfirmed])

    useEffect(() => {
        if(!search) {
            handleHistory(selectedRegions, secondaryGraph)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if(confirmed) {
            const totalRegions = Object.values(confirmed['!Total US'])
            setConfirmedTotal(totalRegions[totalRegions.length - 1])

        }
    }, [confirmed])    

    const handleSelectedRegion = (regionList) => {
        setSelectedRegions(regionList)
        handleHistory(regionList, graph)

        ReactGA.event({
            category: 'Region:U.S. Regions',
            action: `Changed selected regions to ${regionList.join(', ')}`
        }) 
    }

    const handleSelectedGraph = (selectedGraph) => {
        setSecondaryGraph(selectedGraph)
        handleHistory(selectedRegions, selectedGraph)

        ReactGA.event({
            category: 'Region:U.S. Regions',
            action: `Changed selected graph to ${selectedGraph}`
        })

    }    

    const handleGraphScale = (logScale) => {
        setShowLog(logScale)
        handleHistory(selectedRegions, secondaryGraph, logScale)

        ReactGA.event({
            category: 'Region:U.S. Regions',
            action: `Changed graph scale to ${logScale ? 'logarithmic' : 'linear'}`
        })
    }

    return (
        <>  
        <HeroElement
            subtitle="United States"
            title={
                <>Coronavirus Cases by Region</>
            }
            buttons={[
                { title: 'Cases By State', location: '/covid/us' },
                { title: 'Cases By Region', location: '/covid/us/regions' },
            ]}
        />

        <BoxWithLoadingIndicator hasData={sortedConfirmed}>
        <TwoGraphLayout>
            <>           
                <CheckboxRegionComponent
                    data={sortedConfirmed}
                    selected={selectedRegions}
                    handleSelected={dataList => handleSelectedRegion(dataList)} 
                    defaultSelected={region}
                    showLog={showLog}
                    parentRegion="U.S. Regions"
                />
            </>

            <TabbedCompareGraphs
                    secondaryGraph={secondaryGraph}
                    confirmed={confirmed}
                    deaths={deaths}
                    mortality={mortality}
                    selected={selectedRegions}
                    handleSelectedGraph={handleSelectedGraph}
                    handleGraphScale={handleGraphScale}
                    showLog={showLog}
                />

            <Level>
                <Level.Item>
                    {!showLog &&
                        <>
                            <Tag size="large" color="danger">Total Cases: {confirmedTotal}</Tag>
                            <br />
                        </>
                    }
                </Level.Item>
            </Level>
                             
            <Notification style={{fontSize: '1.4rem'}}>
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
            </Notification> 

        </TwoGraphLayout>
        </BoxWithLoadingIndicator>
        </>
    )
}

export default USRegionsGraphContainer