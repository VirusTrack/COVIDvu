import React from 'react'

import { Column } from 'rbx'
import { useLocation } from 'react-router'
import { useMobileDetect } from '../hooks/ui'

import ShareButtons from '../components/ShareButtons'
import GraphImageDownloadButton from './GraphImageDownloadButton'
import GraphScaleControl from './GraphScaleControl'
import GraphDownloadButton from './GraphDownloadButton'

import { GRAPHSCALE_TYPES } from '../constants'

export const GraphControls = ({
  scale,
  graphScale = GRAPHSCALE_TYPES.LINEAR,
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
  centered = false,
  htmlId = null,
}) => {
  const detectMobile = useMobileDetect()
  const location = useLocation()

  const shareUrl = `https://virustrack.live${location.pathname}${location.search}${htmlId ? `#${htmlId}` : ''}`

  return (
    <Column.Group className="graph-controls" multiline>

      {scale
            && (
            <GraphScaleControl
              showLog={showLog}
              graphScale={graphScale}
              handleGraphScale={handleGraphScale}
              showPredictions={showPredictions}
              handleShowPredictions={handleShowPredictions}
              secondaryGraph={secondaryGraph}
              parentRegion={parentRegion}
              align={centered ? 'center' : null}
            />
            )}
      <Column.Group breakpoint="mobile" multiline>
        <Column style={{ textAlign: centered ? 'center' : null }}>
            <ShareButtons 
                title={document.title}
                shareUrl={shareUrl}
            />
        </Column>

        {(!detectMobile.isMobile() && downloadImage)
              && (
              <Column narrow>
                <GraphImageDownloadButton secondaryGraph={secondaryGraph} parentRegion={parentRegion} selected={selected} showLog={showLog} />
              </Column>
              )}
        {downloadCSV && <Column narrow><GraphDownloadButton data={data} /></Column>}
      </Column.Group>
    </Column.Group>
  )
}
export default GraphControls
