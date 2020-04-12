import React, { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router'
import { Tag, Level } from 'rbx'
import numeral from 'numeral'
import ReactGA from 'react-ga'
import store from 'store2'
import { useHandleHistory } from '../hooks/nav'
import { useGraphData } from '../hooks/graphData'
import { useChangePageTitle } from '../hooks/ui'

import { actions } from '../ducks/services'


import TwoGraphLayout from '../layouts/TwoGraphLayout'
import TabbedCompareGraphs from '../components/TabbedCompareGraphs'

import CheckboxRegionComponent from '../components/CheckboxRegionComponent'
import HeroElement from '../components/HeroElement'
import BoxWithLoadingIndicator from '../components/BoxWithLoadingIndicator'


import { GLOBAL_REGION_SELECT_KEY, GLOBAL_GRAPH_SCALE_KEY, GRAPHSCALE_TYPES } from '../constants'

export const GlobalGraphContainer = ({
  region = [], graph = 'Cases', graphScaleParam = GRAPHSCALE_TYPES.LINEAR, showPredictionsParam = false,
}) => {
  const dispatch = useDispatch()
  const { search } = useLocation()
  const changePageTitle = useChangePageTitle()

  const handleHistory = useHandleHistory('/covid')

  const [graphScale, setGraphScale] = useState(graphScaleParam)
  const [showPredictions, setShowPredictions] = useState(showPredictionsParam)
  const [selectedCountries, setSelectedCountries] = useState(region)
  const [secondaryGraph, setSecondaryGraph] = useState(graph)

  const {
    confirmed, sortedConfirmed, deaths, mortality,
  } = useGraphData('global')

  const globalPredictions = useSelector((state) => state.services.globalPredictions)
  const globalStats = useSelector((state) => state.services.totalGlobalStats)

  const [confirmedTotal, setConfirmedTotal] = useState(0)

  useEffect(() => {
    if (globalStats) {
      changePageTitle(`Coronavirus Update ${numeral(globalStats.confirmed).format('0,0')} Cases and ${numeral(globalStats.deaths).format('0,0')} Deaths from COVID-19 Virus Pandemic | VirusTrack.live`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalStats])

  /**
     * Fetch all the data
     */
  useEffect(() => {
    dispatch(actions.fetchGlobal())
    dispatch(actions.fetchGlobalPredictions())
    dispatch(actions.fetchTotalGlobalStats())

    if (store.get(GLOBAL_GRAPH_SCALE_KEY)) {
      setGraphScale(store.get(GLOBAL_GRAPH_SCALE_KEY))
    }
  }, [dispatch, graphScale])

  // Select the Top 3 confirmed from list if nothing is selected
  useEffect(() => {
    if (sortedConfirmed && region.length === 0) {
      let newSelectedCountries = []
      if (store.get(GLOBAL_REGION_SELECT_KEY)) {
        newSelectedCountries = store.get(GLOBAL_REGION_SELECT_KEY)
      } else {
        newSelectedCountries = sortedConfirmed.slice(1, 4).map((confirmed) => confirmed.region)
      }

      setSelectedCountries(newSelectedCountries)
      handleHistory(newSelectedCountries, secondaryGraph, graphScale, showPredictions)
    } else if (showPredictions) {
      if ((region.length === 1 && !Object.prototype.hasOwnProperty.call(globalPredictions, region)) || region.length > 1) {
        setSelectedCountries(['US'])
        handleHistory(['US'], secondaryGraph, graphScale, showPredictions)
      }
    } else if (!sortedConfirmed) {
      dispatch(actions.fetchGlobal())
      dispatch(actions.fetchGlobalPredictions())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedConfirmed])

  useEffect(() => {
    if (!search) {
      handleHistory(selectedCountries, secondaryGraph, graphScale, showPredictions)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (confirmed) {
      let theConfirmedTotal = 0

      for (const confirm of sortedConfirmed) {
        if (confirm.region === '!Global') {
          theConfirmedTotal += confirm.stats
        }
      }
      setConfirmedTotal(theConfirmedTotal)
    }
  }, [confirmed, selectedCountries, sortedConfirmed])

  const handleSelectedRegion = (regionList) => {
    setSelectedCountries(regionList)
    handleHistory(regionList, secondaryGraph, graphScale, showPredictions)

    let actionDescription = `Changed selected regions to ${regionList.join(', ')}`

    if (regionList.length === 0) {
      store.remove(GLOBAL_REGION_SELECT_KEY)
      actionDescription = 'Deselected All Regions'
    } else {
      store.set(GLOBAL_REGION_SELECT_KEY, regionList)
    }

    ReactGA.event({
      category: 'Region:Global',
      action: actionDescription,
    })
  }

  const handleSelectedGraph = (selectedGraph) => {
    setSecondaryGraph(selectedGraph)
    handleHistory(selectedCountries, selectedGraph, graphScale, showPredictions)

    ReactGA.event({
      category: 'Region:Global',
      action: `Changed selected graph to ${selectedGraph}`,
    })
  }

  const handleGraphScale = (graphScale) => {
    console.log(`handleGraphScale: ${graphScale}`)
    setGraphScale(graphScale)
    store.set(GLOBAL_GRAPH_SCALE_KEY, graphScale)

    handleHistory(selectedCountries, secondaryGraph, graphScale, showPredictions)

    ReactGA.event({
      category: 'Region:Global',
      action: `Changed graph scale to ${graphScale}`,
    })
  }

  const handleShowPredictions = () => {
    let historicSelectedCountries = selectedCountries

    if (selectedCountries.length > 1) {
      historicSelectedCountries = ['US']
      setSelectedCountries(historicSelectedCountries)
    }
    setShowPredictions(!showPredictions)

    handleHistory(historicSelectedCountries, secondaryGraph, graphScale, !showPredictions)
  }

  return (
    <>
      <HeroElement
        subtitle="Global"
        title={
          <>Coronavirus Cases by Country</>
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
              handleSelected={(dataList) => handleSelectedRegion(dataList)}
              defaultSelected={region}
              showPredictions={showPredictions}
              predictions={globalPredictions}
              secondaryGraph={secondaryGraph}
              parentRegion="Global"
            />

          </>

          <TabbedCompareGraphs
            secondaryGraph={secondaryGraph}
            confirmed={confirmed}
            deaths={deaths}
            mortality={mortality}
            selected={selectedCountries}
            handleSelectedGraph={handleSelectedGraph}
            handleGraphScale={handleGraphScale}
            handleShowPredictions={handleShowPredictions}
            predictions={globalPredictions}
            graphScale={graphScale}
            showPredictions={showPredictions}
            parentRegion="Global"
          />

          <>
            <Level>
              <Level.Item>
                {graphScale === GRAPHSCALE_TYPES.LINEAR
                  && (
                  <Tag size="large" color="danger">
                    Total Cases:
                    {numeral(confirmedTotal).format('0,0')}
                  </Tag>
                )}
              </Level.Item>
            </Level>

          </>

        </TwoGraphLayout>
      </BoxWithLoadingIndicator>

    </>
  )
}

export default GlobalGraphContainer
