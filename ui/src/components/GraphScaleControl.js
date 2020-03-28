import React from 'react'

import { Generic, Button, Checkbox } from 'rbx'

export const GraphScaleControl = ({
    showLog = false, 
    showPredictions = false,
    handleGraphScale, 
    handleShowPredictions,
    secondaryGraph, 
    align = 'flex-start',
    parentRegion,
}) => {

    if(secondaryGraph === 'Mortality') {
        return null
    }

    return (
        <Generic as="div" align={align} >
            <span style={{fontSize: '1.4rem'}}>Graph Scale:&nbsp;</span>
            <Button size="medium" outlined color={!showLog?"secondary":"default"} onClick={() => { if(showLog) { handleGraphScale(false) } }}>Linear</Button>&nbsp; 
            <Button tooltip="Steeper slope on log scale means faster disease spread" size="medium" color={showLog?"secondary":"default"} outlined onClick={() => { if(!showLog) { handleGraphScale(true) } }}>Logarithmic</Button>
            &nbsp;
            { parentRegion === 'Global' &&
                <span style={{fontSize: '1.4rem'}}>
                    <Checkbox onChange={handleShowPredictions} checked={showPredictions} /> Show Predictions
                </span>
            }
        </Generic>
    )
}

export default GraphScaleControl