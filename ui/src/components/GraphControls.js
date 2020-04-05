import React from 'react'

import { Column } from 'rbx'
import { useMobileDetect } from '../hooks/ui'

import { useLocation } from 'react-router'

import GraphImageDownloadButton from '../components/GraphImageDownloadButton'
import GraphScaleControl from '../components/GraphScaleControl'
import GraphDownloadButton from '../components/GraphDownloadButton'


import {
  FacebookShareButton,
  RedditShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  RedditIcon,
  WhatsappIcon,
} from "react-share";


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
                                htmlId = null
                              }) => {

  const detectMobile = useMobileDetect()

  const location = useLocation()

  const shareUrl = `https://virustrack.live${location.pathname}${location.search}${htmlId ? '#' + htmlId : ''}`
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
            
          <Column.Group breakpoint="mobile" >

          <Column narrow>
              <FacebookShareButton url={shareUrl}>
                <FacebookIcon size={26} />
              </FacebookShareButton>
              &nbsp;
              <TwitterShareButton 
                    url={shareUrl} 
                    title={document.title}
              >
                <TwitterIcon size={26} />
              </TwitterShareButton> 
              &nbsp;
              <RedditShareButton url={shareUrl} title={document.title}>
                <RedditIcon size={26} />
              </RedditShareButton>
              &nbsp;
              <WhatsappShareButton url={shareUrl} title={document.title}>
                <WhatsappIcon size={26} />
              </WhatsappShareButton>
          </Column>

          {(!detectMobile.isMobile() && downloadImage) && 
              <Column narrow>
                <GraphImageDownloadButton secondaryGraph={secondaryGraph} parentRegion={parentRegion} selected={selected} showLog={showLog} />
              </Column>
          }
          {downloadCSV && <Column narrow><GraphDownloadButton data={data} /></Column>}
          </Column.Group>
      </Column.Group>
  )
}
export default GraphControls