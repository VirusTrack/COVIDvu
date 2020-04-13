import React, { useEffect, useState } from 'react'

import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router'

import { Tag, Notification, Level } from 'rbx'
import { useGraphData } from '../hooks/graphData'
import useGraphFilter from '../hooks/graphFilter'

import { actions } from '../ducks/services'

import TwoGraphLayout from '../layouts/TwoGraphLayout'
import TabbedCompareGraphs from '../components/TabbedCompareGraphs'

import CheckboxRegionComponent from '../components/CheckboxRegionComponent'
import HeroElement from '../components/HeroElement'
import BoxWithLoadingIndicator from '../components/BoxWithLoadingIndicator'
import { GRAPHSCALE_TYPES } from '../constants'


export const USRegionsGraphContainer = ({ region = [], graph = 'Cases', graphScaleParam = false }) => {
  const dispatch = useDispatch()
  const location = useLocation()
  const { search } = location

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
    'Northeast',
    'U.S. Regions',
    '/covid/us/regions'
)  
  const {
    confirmed, sortedConfirmed, deaths, mortality,
  } = useGraphData('usRegions')

  const [confirmedTotal, setConfirmedTotal] = useState(0)

  useEffect(() => {
    dispatch(actions.fetchUSRegions())
  }, [dispatch])

  // Select the Top 3 confirmed from list if nothing is selected
  useEffect(() => {
    if (sortedConfirmed && region.length === 0) {
      handleSelectedRegion(sortedConfirmed.slice(0, 3).map((confirmed) => confirmed.region))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedConfirmed])

  useEffect(() => {
    if (confirmed) {
      const totalRegions = Object.values(confirmed['!Total US'])
      setConfirmedTotal(totalRegions[totalRegions.length - 1])
    }
  }, [confirmed])

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
              graphScale={graphScale}
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
            graphScale={graphScale}
          />

          <Level>
            <Level.Item>
              {graphScale === GRAPHSCALE_TYPES.LINEAR
                        && (
                        <>
                          <Tag size="large" color="danger">
                            Total Cases:
                            {confirmedTotal}
                          </Tag>
                          <br />
                        </>
                        )}
            </Level.Item>
          </Level>

          <Notification style={{ fontSize: '1.4rem' }}>
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
