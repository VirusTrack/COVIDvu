import React from 'react'
import { Button } from 'rbx'

export const CheckboxRegionComponent = ({data, selected, handleSelected}) => {

  const renderDisplay = (value) => {
    return value.startsWith('!') ? value.substring(1) : value            
}

const onChange = (event) => {
  const options = event.target.options

  let dataList = []
  for(const option of options) {
      if(option.selected) {
          dataList.push(option.value)
      }
  }

  handleSelected(dataList)
}

    return (
      <div className="CheckboxRegionComponent">
        <Button.Group className="CheckboxRegionOptions">
          <Button size="medium">Select Default</Button>
          <Button size="medium">Deselect All</Button>
        </Button.Group>
        <form className="CheckboxRegionForm">
                {data.map(element => (
                  <>
                    <input className="CheckboxRegionCheckbox" type="checkbox" id={element.region} key={element.region} value={element.region} />
                      <label for={element.region}>
                        <span className="label-name">{renderDisplay(`${element.region}`)} </span>
                        <span className="label-stats">{renderDisplay(`${element.stats}`)}</span>
                      </label>
                    </>
                ))}
        </form>
      </div>
    )
}

export default CheckboxRegionComponent