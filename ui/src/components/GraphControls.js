import React from 'react'

import { Column } from 'rbx'
import { useMobileDetect } from '../hooks/ui'

import GraphImageDownloadButton from '../components/GraphImageDownloadButton'
import GraphScaleControl from '../components/GraphScaleControl'
import GraphDownloadButton from '../components/GraphDownloadButton'

export const GraphControls = ({
                                scale, 
                                downloadImage, 
                                downloadCSV, 
                                secondaryGraph, 
                                showLog, 
                                showPredictions,
                                parentRegion, 
                                handleGraphScale, 
                                handleShowPredictions,
                                selected, 
                                data, 
                                centered = false}) => {

  const detectMobile = useMobileDetect()

  return (
      <Column.Group className="graph-controls" breakpoint="desktop"> 
      
      {scale && 
        <GraphScaleControl 
          showLog={showLog}
          handleGraphScale={handleGraphScale}
          showPredictions={showPredictions}
          handleShowPredictions={handleShowPredictions}
          secondaryGraph={secondaryGraph}
          parentRegion={parentRegion}
          centered={centered} />
        }
      <Column.Group breakpoint="mobile" style={{alignItems: 'center'}} >
      {(!detectMobile.isMobile() && downloadImage) && 
      <Column narrow>
        <GraphImageDownloadButton secondaryGraph={secondaryGraph} parentRegion={parentRegion} selected={selected} showLog={showLog} />
        </Column>}
      {downloadCSV && <Column narrow><GraphDownloadButton data={data} /></Column>}
      </Column.Group>
      </Column.Group>
  )
}
export default GraphControls