import React, { useState, useEffect, useRef } from 'react'
import { Button } from 'rbx'

import numeral from 'numeral'

import ReactGA from 'react-ga'

import { useMobileDetect } from '../hooks/ui'

import { groupByKey } from '../utils'

export const CheckboxRegionComponent = (
  {
    data,
    predictions,
    selected,
    handleSelected,
    showPredictions = false,
    parentRegion,
    secondaryGraph,
  },
) => {
  const [regionList, setRegionList] = useState(data)
  const [alphaSort, setAlphaSort] = useState(false)

  const [toggledOpen, setToggledOpen] = useState(false)

  const detectMobile = useMobileDetect()

  const handleToggledOpen = () => {
    setToggledOpen(!toggledOpen)
  }

  const renderDisplay = (value) => (value.startsWith('!') ? value.substring(1) : value)

  const onChange = (region) => {
    if (showPredictions) {
      handleSelected([region])
      return
    }

    if (selected.indexOf(region) === -1) {
      handleSelected([...selected, region])
    } else {
      handleSelected(selected.filter((elem) => elem !== region))
    }
  }

  const changeAlphaSort = (selectedAlphaSort) => {
    setAlphaSort(selectedAlphaSort)
    ReactGA.event({
      category: `Region:${parentRegion}`,
      action: `Changed sorting of regions to ${selectedAlphaSort ? 'alphabetical' : 'confirmed'}`,
    })
  }

  const mounted = useRef()

  useEffect(() => {
    if (showPredictions && Object.keys(predictions).length > 0) {
      const countryByKey = groupByKey('region', data)
      const predictionsList = Object.keys(predictions).map((region) => ({ region, stats: countryByKey[region].stats }))

      if (alphaSort) {
        const sortedList = predictionsList.concat().sort((a, b) => a.region.localeCompare(b.region))
        setRegionList(sortedList)
      } else {
        const sortedList = predictionsList.concat().sort((a, b) => b.stats - a.stats)
        setRegionList(sortedList)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [predictions])

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
    } else {
      console.log(`showPredictions: ${showPredictions}`)
      console.log(`secondaryGraph: ${secondaryGraph}`)

      if (showPredictions && secondaryGraph === 'Cases') {
        const countryByKey = groupByKey('region', data)
        const predictionsList = Object.keys(predictions).map((region) => ({ region, stats: countryByKey[region].stats }))

        if (alphaSort) {
          const sortedList = predictionsList.concat().sort((a, b) => a.region.localeCompare(b.region))
          setRegionList(sortedList)
        } else {
          const sortedList = predictionsList.concat().sort((a, b) => b.stats - a.stats)
          setRegionList(sortedList)
        }
      } else if (alphaSort) {
        setRegionList(data.concat().sort((a, b) => a.region.localeCompare(b.region)))
      } else {
        setRegionList(data)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alphaSort, showPredictions, secondaryGraph])

  return (
    <div className="CheckboxRegionComponent">
      {detectMobile.isMobile()

      && (
      <div style={{ padding: '1rem' }}>
        <Button fullwidth onClick={handleToggledOpen} size="large">
          {toggledOpen ? 'Hide' : 'Show'}
          {' '}
          Region Options
        </Button>

        {!toggledOpen
        && (
        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '1.4rem' }}>
          {selected.length > 0 ? <span style={{ textAlign: 'center' }}>{!toggledOpen && <span>Selected: </span>}</span> : <>{!toggledOpen && <span>Please select a region using the button above.</span>}</>}
          {!toggledOpen
          && (
          <ul className="comma-separated" style={{ display: 'inline', padding: 0, margin: 0 }}>
            {regionList.map((element, idx) => (
              selected.indexOf(element.region) !== -1
              && (
              <li key={idx} style={{ display: 'inline', padding: 0, margin: 0 }}>
                <span>{renderDisplay(`${element.region}`)}</span>
              </li>
              )))}
          </ul>
          )}
        </div>
        ) }

      </div>
      )}
      {toggledOpen || !detectMobile.isMobile()
        ? (
          <>
            <div className="CheckboxRegionOptions">
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.5rem',
              }}
              >
                Sort By:
                {' '}
                <Button size="small" outlined onClick={() => { handleSelected([]) }}>Deselect All</Button>
              </div>
              <Button.Group size="large" hasAddons style={{ paddingBottom: '1rem' }}>

                {/* <Button size="medium" onClick={() => { handleSelected(defaultSelected)}}>Select Default</Button> */}
                <Button style={{ flexGrow: '1', background: alphaSort ? 'rgba(0,25,50,.075)' : null, borderColor: alphaSort ? 'rgba(0,25,50,.1)' : null }} selected={alphaSort} onClick={() => { changeAlphaSort(false) }}>Confirmed</Button>
                <Button style={{ flexGrow: '1', background: !alphaSort ? 'rgba(0,25,50,.075)' : null, borderColor: !alphaSort ? 'rgba(0,25,50,.1)' : null }} selected={!alphaSort} onClick={() => { changeAlphaSort(true) }}>Alphabetical</Button>
              </Button.Group>


            </div>
            <div>
              {/* fixes form overflow bug in firefox */}
              <form className="CheckboxRegionForm">
                {regionList.map((element, idx) => (
                  <React.Fragment key={idx}>
                    <input className="CheckboxRegionCheckbox" checked={selected.indexOf(element.region) !== -1} type="checkbox" onChange={() => { onChange(element.region) }} id={element.region} key={element.region} value={element.region} />
                    <label htmlFor={element.region}>
                      <span className="label-name">
                        {renderDisplay(`${element.region}`)}
                        {' '}
                      </span>
                      <span className="label-stats">{renderDisplay(`${numeral(element.stats).format('0,0')}`)}</span>
                    </label>
                  </React.Fragment>
                ))}
              </form>
            </div>
          </>
        )
        : null}
    </div>
  )
}

export default CheckboxRegionComponent
