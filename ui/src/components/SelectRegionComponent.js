import React from 'react'

import { Select } from 'rbx'

export const SelectRegionComponent = ({data, selected, handleSelected}) => {

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
        <Select.Container style={{marginTop: '0.5rem'}}>
            <Select multiple size={10} value={selected} onChange={onChange}>
                {data.map(element => (
                    <Select.Option key={element} value={element}>{element}</Select.Option>
                ))}
            </Select>
        </Select.Container>

    )
}

export default SelectRegionComponent