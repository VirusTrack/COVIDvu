import React, { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router'
import { Tag, Level } from 'rbx'
import numeral from 'numeral'

import store from 'store2'
import { useGraphData } from '../hooks/graphData'
import { useChangePageTitle } from '../hooks/ui'
import useGraphFilter from '../hooks/graphFilter'

import { actions } from '../ducks/services'

import TwoGraphLayout from '../layouts/TwoGraphLayout'
import TabbedCompareGraphs from '../components/TabbedCompareGraphs'

import CheckboxRegionComponent from '../components/CheckboxRegionComponent'
import HeroElement from '../components/HeroElement'
import BoxWithLoadingIndicator from '../components/BoxWithLoadingIndicator'

import { GLOBAL_REGION_SELECT_KEY, GLOBAL_GRAPH_SCALE_KEY, GRAPHSCALE_TYPES } from '../constants'

import { graphScaleOrDefault } from '../utils'

export const GlobalGraphContainer = ({
    region = [], 
    graph = 'Cases', 
    graphScaleParam = GRAPHSCALE_TYPES.LINEAR, 
    showPredictionsParam = false,
  }) => {

  const dispatch = useDispatch()
  const { search } = useLocation()
  const changePageTitle = useChangePageTitle()

  const { 
      selectedRegions, 
      graphScale,
      showPredictions,
      secondaryGraph,
      handleSelectedRegion, 
      handleSelectedGraph, 
      handleShowPredictions, 
      handleGraphScale 
  } = useGraphFilter(
      region, 
      graphScaleParam, 
      graph, 
      showPredictionsParam, 
      GLOBAL_GRAPH_SCALE_KEY,
      search,
      'US',
      'Global',
      '/covid'
  )

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
    console.log("GlobalGraphContainer.useEffect.dispatch")

    dispatch(actions.fetchGlobal())
    dispatch(actions.fetchGlobalPredictions())
    dispatch(actions.fetchTotalGlobalStats())

    if (store.get(GLOBAL_GRAPH_SCALE_KEY)) {
      handleGraphScale(graphScaleOrDefault(store.get(GLOBAL_GRAPH_SCALE_KEY)))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, graphScale])

  // Select the Top 3 confirmed from list if nothing is selected
  useEffect(() => {
    console.log("GlobalGraphContainer.useEffect.sortedConfirmed")

    if (sortedConfirmed && region.length === 0) {
      let newSelectedCountries = []
      if (store.get(GLOBAL_REGION_SELECT_KEY)) {
        newSelectedCountries = store.get(GLOBAL_REGION_SELECT_KEY)
      } else {
        newSelectedCountries = sortedConfirmed.slice(1, 4).map((confirmed) => confirmed.region)
      }

      handleSelectedRegion(newSelectedCountries)
    } else if (showPredictions) {
      if ((region.length === 1 && !Object.prototype.hasOwnProperty.call(globalPredictions, region)) || region.length > 1) {
        handleSelectedRegion(['US'])
      }
    } else if (!sortedConfirmed) {
      dispatch(actions.fetchGlobal())
      dispatch(actions.fetchGlobalPredictions())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedConfirmed])


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
  }, [confirmed, sortedConfirmed])

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
              selected={selectedRegions}
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
            selected={selectedRegions}
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
