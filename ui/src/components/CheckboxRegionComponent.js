import React from 'react'
import { Button } from 'rbx'

export const CheckboxRegionComponent = ({data, selected, handleSelected, defaultSelected = []}) => {

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

  return (
    <div className="CheckboxRegionComponent">
      <Button.Group className="CheckboxRegionOptions">
        {/* <Button size="medium" onClick={() => { handleSelected(defaultSelected)}}>Select Default</Button> */}
        <Button size="medium" onClick={() => { handleSelected([]) }}>Deselect All</Button>
      </Button.Group>
      <form className="CheckboxRegionForm">
              {data.map((element, idx) => (
                <React.Fragment key={idx}>
                  <input className="CheckboxRegionCheckbox" checked={selected.indexOf(element.region) !== -1} type="checkbox" onChange={() => { onChange(element.region) }} id={element.region} key={element.region} value={element.region} />
                    <label htmlFor={element.region}>
                      <span className="label-name">{renderDisplay(`${element.region}`)} </span>
                      <span className="label-stats">{renderDisplay(`${element.stats}`)}</span>
                    </label>
                  </React.Fragment>
              ))}
      </form>
    </div>
  )
}

export default CheckboxRegionComponent