import React, { useState, useEffect, useRef } from 'react'
import { Button } from 'rbx'

import numeral from 'numeral'

import ReactGA from 'react-ga';

export const CheckboxRegionComponent = ({data, selected, handleSelected, defaultSelected = [], showLog = false, parentRegion}) => {

  const [regionList, setRegionList] = useState(data)
  const [alphaSort, setAlphaSort] = useState(false)

  const renderDisplay = (value) => {
    return value.startsWith('!') ? value.substring(1) : value            
  }

  const onChange = (region) => {

    if(selected.indexOf(region) === -1) {
      handleSelected([...selected, region])
    } else {
      handleSelected(selected.filter(elem => elem !== region))
    }
  }

  const changeAlphaSort = (selectedAlphaSort) => {
    setAlphaSort(selectedAlphaSort)
    ReactGA.event({
      category: `Region:${parentRegion}`,
      action: `Changed sorting of regions to ${selectedAlphaSort ? 'alphabetical' : 'confirmed'}`
    })

  }

  const mounted = useRef()

  useEffect(() => {
    if(!mounted.current) {
      mounted.current = true
    } else {
      if(alphaSort) {
        let sortedRegionList = data.concat().sort((a, b) => a.region.localeCompare(b.region))
        setRegionList(sortedRegionList)
      } else {
        setRegionList(data)
      }
    }
  }, [alphaSort])

  const AlphaOrByConfirmedButton = () => (
    <>
    { alphaSort && <Button size="medium" onClick={() => { changeAlphaSort(false) }}>Sort By Confirmed</Button> }
    { !alphaSort && <Button size="medium" onClick={() => { changeAlphaSort(true) }}>Sort Alphabetical</Button> }
    </>
  )

  return (
    <div className="CheckboxRegionComponent">
      <Button.Group className="CheckboxRegionOptions">
          {/* <Button size="medium" onClick={() => { handleSelected(defaultSelected)}}>Select Default</Button> */}
          <AlphaOrByConfirmedButton />
          <Button size="medium" onClick={() => { handleSelected([]) }}>Deselect All</Button>
        </Button.Group>
      <div>{/* fixes form overflow bug in firefox */}
        <form className="CheckboxRegionForm">
                {regionList.map((element, idx) => (
                  <React.Fragment key={idx}>
                    <input className="CheckboxRegionCheckbox" checked={selected.indexOf(element.region) !== -1} type="checkbox" onChange={() => { onChange(element.region) }} id={element.region} key={element.region} value={element.region} />
                      <label htmlFor={element.region}>
                        <span className="label-name">{renderDisplay(`${element.region}`)} </span>
                        <span className="label-stats">{renderDisplay(`${numeral(element.stats).format('0,0')}`)}</span>
                      </label>
                    </React.Fragment>
                ))}
        </form>
      </div>
    </div>
  )
}

export default CheckboxRegionComponent