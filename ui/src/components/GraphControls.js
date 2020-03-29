import React from 'react'

import { Column } from 'rbx'

import GraphImageDownloadButton from '../components/GraphImageDownloadButton'
import GraphScaleControl from '../components/GraphScaleControl'
import GraphDownloadButton from '../components/GraphDownloadButton'

export const GraphControls = ({scale, downloadImage, downloadCSV, secondaryGraph, showLog, handleGraphScale, data, centered = false}) => {
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
      {downloadImage && <Column narrow><GraphImageDownloadButton /></Column>}
      {downloadCSV && <Column narrow><GraphDownloadButton data={data} /></Column>}
      </Column.Group>
  )
}
export default GraphControls