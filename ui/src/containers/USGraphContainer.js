import React, { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router'
import numeral from 'numeral'
import { Tag, Title } from 'rbx'
import ReactGA from 'react-ga'
import store from 'store2'
import { useChangePageTitle } from '../hooks/ui'

import { useHandleHistory } from '../hooks/nav'
import { useGraphData } from '../hooks/graphData'


import { actions } from '../ducks/services'

import { renderDisplay } from '../utils'

import { US_REGION_SELECT_KEY, US_GRAPH_SCALE_KEY } from '../constants'

import TwoGraphLayout from '../layouts/TwoGraphLayout'
import TabbedCompareGraphs from '../components/TabbedCompareGraphs'

import CheckboxRegionComponent from '../components/CheckboxRegionComponent'
import HeroElement from '../components/HeroElement'
import BoxWithLoadingIndicator from '../components/BoxWithLoadingIndicator'
import ExternalLink from '../components/ExternalLink'

export const USGraphContainer = ({
  region = [], graph = 'Cases', showLogParam = false, showPredictionsParam = false,
}) => {
  const dispatch = useDispatch()
  const { search } = useLocation()
  const handleHistory = useHandleHistory('/covid/us')
  const changePageTitle = useChangePageTitle()

  const [showLog, setShowLog] = useState(showLogParam)
  const [showPredictions, setShowPredictions] = useState(showPredictionsParam)
  const [selectedStates, setSelectedStates] = useState(region)
  const [secondaryGraph, setSecondaryGraph] = useState(graph)

  const {
    confirmed, sortedConfirmed, deaths, mortality,
  } = useGraphData('usStates')
  const usStatesStats = useSelector((state) => state.services.totalUSStatesStats)

  const usPredictions = useSelector((state) => state.services.usPredictions)

  const [confirmedTotal, setConfirmedTotal] = useState(0)

  useEffect(() => {
    if (usStatesStats) {
      changePageTitle(`United States Coronavirus ${numeral(usStatesStats.confirmed).format('0,0')} Cases and ${numeral(usStatesStats.deaths).format('0,0')} Deaths from COVID-19 Virus Pandemic | VirusTrack.live`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usStatesStats])


  // Select the Top 3 confirmed from list if nothing is selected
  useEffect(() => {
    if (sortedConfirmed && region.length === 0) {
      let newSelectedStates = []

      if (store.get(US_REGION_SELECT_KEY)) {
        newSelectedStates = store.get(US_REGION_SELECT_KEY)
      } else {
        newSelectedStates = sortedConfirmed.slice(0, 3).map((confirmed) => confirmed.region)
      }

      setSelectedStates(newSelectedStates)
      handleHistory(newSelectedStates, secondaryGraph, showLog, showPredictions)
    } else if (showPredictions) {
      if ((region.length === 1 && !Object.prototype.hasOwnProperty.call(usPredictions, region)) || region.length > 1) {
        setSelectedStates(['New York'])
        handleHistory(['New York'], secondaryGraph, showLog, showPredictions)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedConfirmed])

  useEffect(() => {
    dispatch(actions.fetchUSStates())
    dispatch(actions.fetchUSPredictions())
    dispatch(actions.fetchTotalUSStatesStats())

    if (store.get(US_GRAPH_SCALE_KEY)) {
      setShowLog(store.get(US_GRAPH_SCALE_KEY))
    }
  }, [dispatch])

  useEffect(() => {
    if (!search) {
      handleHistory(selectedStates, secondaryGraph, showLog, showPredictions)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (confirmed) {
      if (Object.prototype.hasOwnProperty.call(confirmed, '!Total US')) {
        const totalStates = Object.values(confirmed['!Total US'])
        setConfirmedTotal(totalStates[totalStates.length - 1])
      }
    }
  }, [confirmed])

  const handleSelectedRegion = (regionList) => {
    setSelectedStates(regionList)
    handleHistory(regionList, graph, showLog, showPredictions)

    let actionDescription = `Changed selected regions to ${regionList.join(', ')}`

    if (regionList.length === 0) {
      store.remove(US_REGION_SELECT_KEY)
      actionDescription = 'Deselected All Regions'
    } else {
      store.set(US_REGION_SELECT_KEY, regionList)
    }

    ReactGA.event({
      category: 'Region:United States',
      action: actionDescription,
    })
  }

  const handleSelectedGraph = (selectedGraph) => {
    setSecondaryGraph(selectedGraph)
    handleHistory(selectedStates, graph, showLog, showPredictions)

    ReactGA.event({
      category: 'Region:United States',
      action: `Changed selected graph to ${selectedGraph}`,
    })
  }

  const handleGraphScale = (logScale) => {
    setShowLog(logScale)
    store.set(US_GRAPH_SCALE_KEY, logScale)

    handleHistory(selectedStates, secondaryGraph, logScale, showPredictions)

    ReactGA.event({
      category: 'Region:United States',
      action: `Changed graph scale to ${logScale ? 'logarithmic' : 'linear'}`,
    })
  }

  const handleShowPredictions = () => {
    let historicSelectedStates = selectedStates

    if (selectedStates.length > 1) {
      historicSelectedStates = ['New York']
      setSelectedStates(historicSelectedStates)
    }
    setShowPredictions(!showPredictions)
    handleHistory(historicSelectedStates, secondaryGraph, showLog, !showPredictions)
  }

  return (
    <>

      <HeroElement
        subtitle="United States"
        title={
          <>Coronavirus Cases by State</>
            }
        buttons={[
          { title: 'Cases By State', location: '/covid/us' },
          { title: 'Cases By Region', location: '/covid/us/regions' },
          { title: 'Cases By County', location: '/stats?filter=US_Counties' },
        ]}
      />

      <BoxWithLoadingIndicator hasData={sortedConfirmed}>
        <TwoGraphLayout>
          <>
            <CheckboxRegionComponent
              data={sortedConfirmed}
              selected={selectedStates}
              handleSelected={(dataList) => handleSelectedRegion(dataList)}
              defaultSelected={region}
              showPredictions={showPredictions}
              predictions={usPredictions}
              secondaryGraph={secondaryGraph}
              showLog={showLog}
              parentRegion="US"
            />
          </>

          <TabbedCompareGraphs
            secondaryGraph={secondaryGraph}
            confirmed={confirmed}
            deaths={deaths}
            mortality={mortality}
            selected={selectedStates}
            handleSelectedGraph={handleSelectedGraph}
            handleGraphScale={handleGraphScale}
            handleShowPredictions={handleShowPredictions}
            predictions={usPredictions}
            showLog={showLog}
            showPredictions={showPredictions}
            parentRegion="US"
          />

          <>
            { !showLog
                    && (
                    <>
                      <Tag size="large" color="danger">
                        Total Cases:
                        {numeral(confirmedTotal).format('0,0')}
                      </Tag>
                      <br />
                    </>
                    )}
          </>

          <>

            <Title size={3}>Government Services: </Title>
            <ul>
              {selectedStates.map((region, idx) => (
                <React.Fragment key={idx}>
                  <li>
                      <ExternalLink 
                          key={region} 
                          externalKey={region}
                          category="Graph:US" 
                          tooltipText="No external link for region yet" 
                      >
                          {renderDisplay(region)}
                      </ExternalLink>
                  </li>
                </React.Fragment>
              ))}
            </ul>
          </>
        </TwoGraphLayout>
      </BoxWithLoadingIndicator>
    </>
  )
}

export default USGraphContainer
