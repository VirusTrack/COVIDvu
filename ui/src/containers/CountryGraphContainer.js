import React, { useEffect } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router'
import { useGraphData } from '../hooks/graphData'
import useGraphFilter from '../hooks/graphFilter'

import { actions } from '../ducks/services'

import TabbedCompareGraphs from '../components/TabbedCompareGraphs'

import HeroElement from '../components/HeroElement'
import BoxWithLoadingIndicator from '../components/BoxWithLoadingIndicator'


export const CountryGraphContainer = ({
  region = 'US', graph = 'Cases', graphScaleParam = false, showPredictionsParam = false,
}) => {
  const dispatch = useDispatch()
  const { search } = useLocation()

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
    null,
    search,
    'US',
    'Country',
    `/covid/country/${region}`
)

  const {
    confirmed, sortedConfirmed, deaths, mortality,
  } = useGraphData('global')

  const globalPredictions = useSelector((state) => state.services.globalPredictions)

  /**
     * Fetch all the data
     */
  useEffect(() => {
    dispatch(actions.fetchGlobal())
    dispatch(actions.fetchGlobalPredictions())
  }, [dispatch, graphScale])

  // Select the Top 3 confirmed from list if nothing is selected
  useEffect(() => {
    if (sortedConfirmed && region.length === 0) {
      const newSelectedCountries = sortedConfirmed.slice(1, 4).map((confirmed) => confirmed.region)
      handleSelectedRegion(newSelectedCountries)
    } else if (showPredictions && Object.keys(globalPredictions).length > 0) {
      if ((region.length === 1 && !Object.prototype.hasOwnProperty.call(globalPredictions, region))) {
        handleSelectedRegion(['US'])
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedConfirmed, globalPredictions])

  return (
    <>
      <HeroElement
        title={(
          <>
            Coronavirus Cases in&nbsp;{region}
          </>
            )}
      />

      <BoxWithLoadingIndicator hasData={sortedConfirmed}>
        <>
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

        </>
      </BoxWithLoadingIndicator>

    </>
  )
}

export default CountryGraphContainer
