import React, { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router'
import numeral from 'numeral'
import { Tag, Title } from 'rbx'
import store from 'store2'
import { useChangePageTitle } from '../hooks/ui'
import useGraphFilter from '../hooks/graphFilter'

import { useGraphData } from '../hooks/graphData'


import { actions } from '../ducks/services'

import { renderDisplay } from '../utils'

import { US_REGION_SELECT_KEY, US_GRAPH_SCALE_KEY, GRAPHSCALE_TYPES } from '../constants'
import { graphScaleOrDefault } from '../utils'

import TwoGraphLayout from '../layouts/TwoGraphLayout'
import TabbedCompareGraphs from '../components/TabbedCompareGraphs'
import CheckboxRegionComponent from '../components/CheckboxRegionComponent'
import HeroElement from '../components/HeroElement'
import BoxWithLoadingIndicator from '../components/BoxWithLoadingIndicator'
import ExternalLink from '../components/ExternalLink'

export const USGraphContainer = ({
  region = [], graph = 'Cases', graphScaleParam = false, showPredictionsParam = false,
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
      US_GRAPH_SCALE_KEY,
      search,
      'New York',
      'United States',
      '/covid/us'
  )

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

      handleSelectedRegion(newSelectedStates)
    } else if (showPredictions) {
      if ((region.length === 1 && !Object.prototype.hasOwnProperty.call(usPredictions, region)) || region.length > 1) {
        handleSelectedRegion(['New York'])
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedConfirmed])

  useEffect(() => {
    dispatch(actions.fetchUSStates())
    dispatch(actions.fetchUSPredictions())
    dispatch(actions.fetchTotalUSStatesStats())

    if (store.get(US_GRAPH_SCALE_KEY)) {
      handleGraphScale(graphScaleOrDefault(store.get(US_GRAPH_SCALE_KEY)))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch])

  useEffect(() => {
    if (confirmed) {
      if (Object.prototype.hasOwnProperty.call(confirmed, '!Total US')) {
        const totalStates = Object.values(confirmed['!Total US'])
        setConfirmedTotal(totalStates[totalStates.length - 1])
      }
    }
  }, [confirmed])

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
              selected={selectedRegions}
              handleSelected={(dataList) => handleSelectedRegion(dataList)}
              defaultSelected={region}
              showPredictions={showPredictions}
              predictions={usPredictions}
              secondaryGraph={secondaryGraph}
              graphScale={graphScale}
              parentRegion="US"
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
            predictions={usPredictions}
            graphScale={graphScale}
            showPredictions={showPredictions}
            parentRegion="US"
          />

          <>
            { graphScale === GRAPHSCALE_TYPES.LINEAR
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
              {selectedRegions.map((region, idx) => (
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
