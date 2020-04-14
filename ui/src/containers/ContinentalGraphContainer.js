import React, { useEffect } from 'react'

import { useDispatch } from 'react-redux'

import { useLocation } from 'react-router'

import { useGraphData } from '../hooks/graphData'
import useGraphFilter from '../hooks/graphFilter'

import { actions } from '../ducks/services'

import TwoGraphLayout from '../layouts/TwoGraphLayout'

import TabbedCompareGraphs from '../components/TabbedCompareGraphs'

import CheckboxRegionComponent from '../components/CheckboxRegionComponent'
import HeroElement from '../components/HeroElement'
import BoxWithLoadingIndicator from '../components/BoxWithLoadingIndicator'


export const ContinentalGraphContainer = ({ 
    region = [], 
    graph = 'Cases', 
    graphScaleParam = false 
  }) => {

  const dispatch = useDispatch()
  const { search } = useLocation()

  const { 
    selectedRegions, 
    graphScale,
    secondaryGraph,
    handleSelectedRegion, 
    handleSelectedGraph, 
    handleGraphScale 
} = useGraphFilter(
    region, 
    graphScaleParam, 
    graph, 
    null, 
    null,
    search,
    'North America',
    'Continental',
    '/covid/continental'
)

  const {
    confirmed, sortedConfirmed, deaths, mortality,
  } = useGraphData('continental')

  /**
     * Fetch all the data
     */
  useEffect(() => {
    dispatch(actions.fetchContinental())
  }, [dispatch])

  // Select the Top 3 confirmed from list if nothing is selected
  useEffect(() => {
    if (sortedConfirmed && region.length === 0) {
      handleSelectedRegion(sortedConfirmed.slice(0, 3).map((confirmed) => confirmed.region))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedConfirmed])

  return (
    <>
      <HeroElement
        subtitle="Global"
        title={
          <>Coronavirus Cases by Continent</>
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
            selected={selectedRegions}
            handleSelected={(dataList) => handleSelectedRegion(dataList)}
            defaultSelected={region}
            graphScale={graphScale}
            parentRegion="Continental"
          />

          <TabbedCompareGraphs
            secondaryGraph={secondaryGraph}
            confirmed={confirmed}
            deaths={deaths}
            mortality={mortality}
            selected={selectedRegions}
            handleSelectedGraph={handleSelectedGraph}
            handleGraphScale={handleGraphScale}
            graphScale={graphScale}
          />

        </TwoGraphLayout>
      </BoxWithLoadingIndicator>
    </>
  )
}

export default ContinentalGraphContainer
