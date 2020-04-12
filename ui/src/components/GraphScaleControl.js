import React from 'react'

import { Button, Column } from 'rbx'

import { GRAPHSCALE_TYPES } from '../constants'

export const GraphScaleControl = ({
  graphScale = GRAPHSCALE_TYPES.LINEAR,
  showPredictions = false,
  handleGraphScale,
  handleShowPredictions,
  secondaryGraph,
  align = 'flex-start',
  parentRegion,
}) => {
  if (secondaryGraph === 'Mortality') {
    return null
  }

  console.log(`graphScale: ${graphScale}`)
  return (
    <>
      <Column.Group style={{ alignItems: 'baseline', justifyContent: align, marginRight: '1rem' }} breakpoint="mobile" multiline>
        <Column narrow>
          <span style={{ fontSize: '1.4rem' }}>Graph Scale:&nbsp;</span>
        </Column>

        <Column narrow>
          <Button.Group hasAddons>
            <Button size="medium" selected={graphScale === GRAPHSCALE_TYPES.LINEAR} color={graphScale === GRAPHSCALE_TYPES.LINEAR ? 'default' : 'light'} onClick={() => { if (graphScale !== GRAPHSCALE_TYPES.LINEAR) { handleGraphScale(GRAPHSCALE_TYPES.LINEAR) } }}>Linear</Button>
            <Button tooltip="Steeper slope on log scale means faster disease spread" size="medium" selected={graphScale === GRAPHSCALE_TYPES.LOGARITHMIC}  color={graphScale === GRAPHSCALE_TYPES.LOGARITHMIC ? 'default' : 'light'} onClick={() => { if (graphScale !== GRAPHSCALE_TYPES.LOGARITHMIC) { handleGraphScale(GRAPHSCALE_TYPES.LOGARITHMIC) } }}>Logarithmic</Button>
            <Button tooltip="Horizontal is stage of outbreak. Slope is reproductive rate." size="medium" selected={graphScale === GRAPHSCALE_TYPES.SLOPE} color={graphScale === GRAPHSCALE_TYPES.SLOPE ? 'default' : 'light'} onClick={() => { if (graphScale !== GRAPHSCALE_TYPES.SLOPE) { handleGraphScale(GRAPHSCALE_TYPES.SLOPE) } }}>Rate</Button>
          </Button.Group>
        </Column>

        { ((parentRegion === 'Global' || parentRegion === 'US') && secondaryGraph === 'Cases')
                    && (
                    <Column>
                      <span style={{ fontSize: '1.4rem' }}>
                        <Button size="medium" outlined={!showPredictions ? true : null} color={!showPredictions ? 'primary' : 'light'} onClick={handleShowPredictions}>{showPredictions ? 'Hide Predictions' : 'Show Predictions'}</Button>
                      </span>
                    </Column>
                    )}

      </Column.Group>
    </>
  )
}

export default GraphScaleControl
