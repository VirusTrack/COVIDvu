import React from 'react'

import { Select } from 'rbx'

export const SelectRegionComponent = ({data, selected, handleSelected}) => {

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
        <Select.Container tooltipPosition="right" tooltip="Ctrl or Cmd-Click to select multiple regions">
            <Select multiple size={10} value={selected} onChange={onChange}>
                {data.map(element => (
                    <Select.Option key={element.region} value={element.region}>{renderDisplay(`${element.region} ${element.stats}`)}</Select.Option>
                ))}
            </Select>
        </Select.Container>

    )
}

export default SelectRegionComponent