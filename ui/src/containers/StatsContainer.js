import React, { useEffect, useState } from 'react'

import { useHistory, useLocation } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { actions } from '../ducks/services'

import { Tab, Button, Level, Notification } from 'rbx'

import ReactGA from 'react-ga'

import LogoElement from '../components/LogoElement'
import HeroElement from '../components/HeroElement'
import BoxWithLoadingIndicator from '../components/BoxWithLoadingIndicator'
import GlobalStatsTable from '../components/GlobalStatsTable'
import USCountiesStatsTable from '../components/USCountiesStatsTable'
import USStatsTable from '../components/USStatsTable'
import ShareButtons from '../components/ShareButtons'

export const StatsContainer = ({ filter = 'Global', daysAgoParam = 0 }) => {
  const dispatch = useDispatch()
  const history = useHistory()

  const location = useLocation()

  const [selectedTab, setSelectedTab] = useState(filter)
  const [filterRegion, setFilterRegion] = useState('NY')
  const [daysAgo, setDaysAgo] = useState(daysAgoParam)
  const [sort, setSort] = useState('confirmed')

  const statsTotals = useSelector((state) => state.services.globalStats)
  const usStatsTotals = useSelector((state) => state.services.usStatesStats)
  const usCountiesStatsTotals = useSelector((state) => state.services.usCountiesStats)

  const [statsForGraph, setStatsForGraph] = useState(undefined)

  const renderDisplay = (value) => (value.startsWith('!') ? value.substring(1) : value)

  const handleSelectedFilter = (selectedFilter) => {
    setFilterRegion(selectedFilter)
    ReactGA.event({
      category: 'Stats',
      action: `Changing filter on US_Counties to ${selectedFilter}`,
      label: 'Changing Filter',
    })
  }

  const handleSort = (column) => {
    setSort(column)
    ReactGA.event({
      category: 'Stats',
      action: `Changed sort to ${sort}`,
      label: 'Sorting',
    })
  }

  /**
     * Fetch all the data
     *
     * we should limit it to what's currently being viewed
     */
  useEffect(() => {
    dispatch(actions.clearStats())

    if (selectedTab === 'Global') {
      dispatch(actions.fetchGlobalStats({ daysAgo, sort }))
    } else if (selectedTab === 'US') {
      dispatch(actions.fetchUSStatesStats({ daysAgo, sort }))
    } else if (selectedTab === 'US_Counties') {
      dispatch(actions.fetchUSCountiesStats({ daysAgo, filterRegion, sort }))
    }
  }, [dispatch, daysAgo, selectedTab, filterRegion, sort])

  useEffect(() => {
    if (selectedTab === 'Global' && statsTotals) {
      setStatsForGraph(statsTotals)
      history.replace('/stats?filter=Global')
    } else if (selectedTab === 'US' && usStatsTotals) {
      setStatsForGraph(usStatsTotals)
      history.replace('/stats?filter=US')
    } else if (selectedTab === 'US_Counties' && usCountiesStatsTotals) {
      setStatsForGraph(usCountiesStatsTotals)
      history.replace('/stats?filter=US_Counties')
    }
  }, [selectedTab, statsTotals, usStatsTotals, usCountiesStatsTotals, history])

  const changeDayView = (daysAgo) => {
    setStatsForGraph([])
    setDaysAgo(daysAgo)
    ReactGA.event({
      category: 'Stats',
      action: `Changed stats to ${daysAgo === 0 ? 'today' : 'yesterday'}`,
    })
  }

  const changeStatsTab = (newSelectedTab) => {
    setStatsForGraph([])
    setSelectedTab(newSelectedTab)
    setSort('confirmed')

    ReactGA.event({
      category: 'Stats',
      action: `Changed stats tab to ${newSelectedTab}`,
    })
  }


  const shareUrl = `https://virustrack.live${location.pathname}${location.search}`

  return (
    <>
      <HeroElement
        title={(
          <>
            Coronavirus
            <br />
            COVID-19 Statistics
          </>
            )}
      />

      <BoxWithLoadingIndicator hasData={statsForGraph}>

        <Notification>
          <Level breakpoint="mobile">
            <Level.Item align="left">
              <LogoElement size="small" />
            </Level.Item>
            { selectedTab !== 'US_Counties'
                        && (
                        <Level.Item align="right">
                          <Button.Group>
                            <Button size="medium" onClick={() => { if (daysAgo !== 0) { changeDayView(0) } }} color={daysAgo === 0 ? 'primary' : 'default'}>Today</Button>
                            <Button size="medium" onClick={() => { if (daysAgo !== 1) { changeDayView(1) } }} color={daysAgo === 1 ? 'primary ' : 'default'}>Yesterday</Button>
                          </Button.Group>
                        </Level.Item>
                        )}
          </Level>
        </Notification>

        <Level breakpoint="mobile">
          <Level.Item>
            <ShareButtons 
                title={document.title}
                shareUrl={shareUrl}
            />
          </Level.Item>
        </Level>
        <Tab.Group size="large">
          <Tab active={selectedTab === 'Global'} onClick={() => { changeStatsTab('Global') }}>Global</Tab>
          <Tab active={selectedTab === 'US'} onClick={() => { changeStatsTab('US') }}>United States</Tab>
          <Tab active={selectedTab === 'US_Counties'} onClick={() => { changeStatsTab('US_Counties') }}>U.S. Counties</Tab>
        </Tab.Group>


        { selectedTab === 'Global' && (
              <GlobalStatsTable
                statsForGraph={statsForGraph}
                renderDisplay={renderDisplay}
                sort={sort}
                onSort={handleSort}
              />
          )}
        { selectedTab === 'US' && (
              <USStatsTable
                statsForGraph={statsForGraph}
                renderDisplay={renderDisplay}
                sort={sort}
                onSort={handleSort}
              />
            )}
        { selectedTab === 'US_Counties' && (
              <USCountiesStatsTable
                statsForGraph={statsForGraph}
                renderDisplay={renderDisplay}
                filterRegion={filterRegion}
                onSelectedFilter={handleSelectedFilter}
                sort={sort}
                onSort={handleSort}
              />
            )}
      </BoxWithLoadingIndicator>
    </>
  )
}

export default StatsContainer
