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
                                parentRegion, 
                                handleGraphScale, 
                                selected, 
                                data, 
                                centered = false}) => {

  const detectMobile = useMobileDetect()

  return (
      <Column.Group centered> 
      
      {scale && <Column narrow={centered}>
        <GraphScaleControl 
          showLog={showLog}
          handleGraphScale={handleGraphScale}
          secondaryGraph={secondaryGraph}
          centered={centered} />
          </Column>
        }
      {(!detectMobile.isMobile() && downloadImage) && <Column narrow><GraphImageDownloadButton secondaryGraph={secondaryGraph} parentRegion={parentRegion} selected={selected} showLog={showLog} /></Column>}
      {downloadCSV && <Column narrow><GraphDownloadButton data={data} /></Column>}
      </Column.Group>
  )
}
export default GraphControls