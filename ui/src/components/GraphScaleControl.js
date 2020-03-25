import React from 'react'

import { Generic, Button } from 'rbx'

export const GraphScaleControl = ({showLog, handleGraphScale, secondaryGraph, align = 'flex-start'}) => {

    if(secondaryGraph === 'Mortality') {
        return null
    }

    return (
        <Generic as="div" align={align} >
            <span style={{fontSize: '1.4rem'}}>Graph Scale:&nbsp;</span>
            <Button size="medium" outlined color={!showLog?"secondary":"default"} onClick={() => { if(showLog) { handleGraphScale(false) } }}>Linear</Button>&nbsp; 
            <Button tooltip="Steeper slope on log scale means faster disease spread" size="medium" color={showLog?"secondary":"default"} outlined onClick={() => { if(!showLog) { handleGraphScale(true) } }}>Logarithmic</Button>
        </Generic>
    )
}

export default GraphScaleControl