import React, { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { useLocation } from 'react-router'

import { Message } from 'rbx'
import useGraphFilter from '../hooks/graphFilter'

import { actions } from '../ducks/services'


import TwoGraphLayout from '../layouts/TwoGraphLayout'
import TabbedCompareGraphs from '../components/TabbedCompareGraphs'

import CheckboxRegionComponent from '../components/CheckboxRegionComponent'
import HeroElement from '../components/HeroElement'
import BoxWithLoadingIndicator from '../components/BoxWithLoadingIndicator'


const countriesRegions = require('../constants/countries_regions.json')

export const RegionGraphContainer = ({
  region, uniqueRegion = [], graph = 'Cases', graphScaleParam = false,
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
    'US',
    `Region:${region}`,
    `/covid/region/${region}`
)

  // TODO look into using the hook for this as well, somehow
  const confirmed = useSelector((state) => (Object.prototype.hasOwnProperty.call(state.services.region, region) ? state.services.region[region].confirmed : undefined))
  const sortedConfirmed = useSelector((state) => (Object.prototype.hasOwnProperty.call(state.services.region, region) ? state.services.region[region].sortedConfirmed : undefined))
  const deaths = useSelector((state) => (Object.prototype.hasOwnProperty.call(state.services.region, region) ? state.services.region[region].deaths : undefined))
  const mortality = useSelector((state) => (Object.prototype.hasOwnProperty.call(state.services.region, region) ? state.services.region[region].mortality : undefined))

  const [regionNotFound, setRegionNotFound] = useState(undefined)

  /**
     * Fetch all the data
     */
  useEffect(() => {
    const uniqueRegionSet = Object.values(countriesRegions).filter((value, index, self) => self.indexOf(value) === index)

    if (uniqueRegionSet.indexOf(region) !== -1) {
      dispatch(actions.fetchRegion({ region }))
    } else {
      setRegionNotFound(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, region])

  // Select the Top 3 confirmed from list if nothing is selected
  useEffect(() => {
    if (sortedConfirmed && uniqueRegion.length === 0) {
      handleSelectedRegion(sortedConfirmed.slice(0, 3).map((confirmed) => confirmed.region))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedConfirmed])

  if (regionNotFound) {
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
        title={(
          <>
            Coronavirus Cases
            <br />
            by Country
          </>
            )}
      />

      <BoxWithLoadingIndicator hasData={sortedConfirmed}>
        <TwoGraphLayout>

          <>
            <CheckboxRegionComponent
              data={sortedConfirmed}
              selected={selectedRegions}
              handleSelected={(dataList) => handleSelectedRegion(dataList)}
              defaultSelected={uniqueRegion}
              graphScale={graphScale}
              parentRegion={region}
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
            graphScale={graphScale}
          />

        </TwoGraphLayout>
      </BoxWithLoadingIndicator>

    </>
  )
}

export default RegionGraphContainer
