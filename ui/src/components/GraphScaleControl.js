import React from 'react'

import { Button, Column } from 'rbx'

export const GraphScaleControl = ({
  showLog = false,
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

  return (
    <>
      <Column.Group style={{ alignItems: 'baseline', justifyContent: align, marginRight: '1rem' }} breakpoint="mobile" multiline>
        <Column narrow>
          <span style={{ fontSize: '1.4rem' }}>Graph Scale:&nbsp;</span>
        </Column>

        <Column narrow>
          <Button.Group hasAddons>
            <Button size="medium" selected={!showLog ? true : null} color={!showLog ? 'default' : 'light'} onClick={() => { if (showLog) { handleGraphScale(false) } }}>Linear</Button>
            <Button tooltip="Steeper slope on log scale means faster disease spread" size="medium" color={showLog ? 'default' : 'light'} onClick={() => { if (!showLog) { handleGraphScale(true) } }}>Logarithmic</Button>
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
