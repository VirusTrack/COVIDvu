import React from 'react'

import { Level, Button } from 'rbx'

export const GraphScaleControl = ({showLog, handleGraphScale, secondaryGraph}) => {

    if(secondaryGraph === 'Mortality') {
        return null
    }

    return (
        <Level>                        
            <Level.Item align="left">
                Graph Scale:&nbsp;<Button color={!showLog?"primary":"default"} onClick={() => { if(showLog) { handleGraphScale(false) } }}>Linear</Button>
                &nbsp;
                <Button tooltip="Steeper slope on log scale means faster disease spread" color={showLog?"primary":"default"} onClick={() => { if(!showLog) { handleGraphScale(true) } }}>Logarithmic</Button>
            </Level.Item>
        </Level>
    )
}

export default GraphScaleControl