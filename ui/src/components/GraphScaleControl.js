import React from 'react'

import { Generic, Button, Column } from 'rbx'

import { ENABLE_PREDICTIONS } from '../constants'

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
            <Column.Group style={{alignItems: 'baseline'}} breakpoint="tablet">
                <Column narrow>
                    <span style={{fontSize: '1.4rem'}}>Graph Scale:&nbsp;</span>
                </Column>
                <Column narrow>
                    <Button.Group hasAddons>
                        <Button  size="medium" selected={!showLog? true : null} color={!showLog?"default":"light"} onClick={() => { if(showLog) { handleGraphScale(false) } }}>Linear</Button>
                        <Button  tooltip="Steeper slope on log scale means faster disease spread" size="medium" color={showLog?"default":"light"} onClick={() => { if(!showLog) { handleGraphScale(true) } }}>Logarithmic</Button>
                    </Button.Group>
                </Column>
            
                <Column>
                { ((parentRegion === 'Global' || parentRegion === 'US') && secondaryGraph === 'Cases' && ENABLE_PREDICTIONS) &&
                    <span style={{fontSize: '1.4rem'}}>
                        <Button size="medium" outlined={!showPredictions?true:null} color={!showPredictions?'primary':'light'} onClick={handleShowPredictions}>{showPredictions ? 'Hide Predictions' : 'Show Predictions'}</Button>
                    </span>
                }
                </Column>
            </Column.Group>
        </Generic>
    )
}

export default GraphScaleControl