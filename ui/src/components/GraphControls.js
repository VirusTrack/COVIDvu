import React from 'react'

import { Column } from 'rbx'
import { useLocation } from 'react-router'
import {
  FacebookShareButton,
  RedditShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  RedditIcon,
  WhatsappIcon,
} from 'react-share'
import { useMobileDetect } from '../hooks/ui'


import GraphImageDownloadButton from './GraphImageDownloadButton'
import GraphScaleControl from './GraphScaleControl'
import GraphDownloadButton from './GraphDownloadButton'


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
          <FacebookShareButton url={shareUrl}>
            <FacebookIcon size={26} style={{ borderRadius: '.4rem' }} />
          </FacebookShareButton>
                &nbsp;
          <TwitterShareButton
            url={shareUrl}
            title={document.title}
          >
            <TwitterIcon size={26} style={{ borderRadius: '.4rem' }} />
          </TwitterShareButton>
                &nbsp;
          <RedditShareButton url={shareUrl} title={document.title}>
            <RedditIcon size={26} style={{ borderRadius: '.4rem' }} />
          </RedditShareButton>
                &nbsp;
          <WhatsappShareButton url={shareUrl} title={document.title}>
            <WhatsappIcon size={26} style={{ borderRadius: '.4rem' }} />
          </WhatsappShareButton>
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
