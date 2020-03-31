import React from 'react'

import { Icon, Button } from 'rbx'
import imgDownload from '../images/fa-icon-download.svg'

import html2canvas from 'html2canvas'
import reimg from 'reimg'

import moment from 'moment'

export const GraphImageDownloadButton = ({secondaryGraph, parentRegion, selected, showLog}) => {
    const ref = React.createRef()

    const saveImage = () => {

      const today = moment().format('YYYY-MM-DD')
      const selectedAsText = selected.map(region => region.startsWith('!') ? region.substr(1) : region).join('_')
      const graphScaleText = showLog ? 'logarithmic' : 'linear'
      const filename = `${secondaryGraph}-${selectedAsText}-${graphScaleText}-${today}.png`

      console.log(`filename: ${filename}`)

      const button = ref.current
      const input = button.closest('.box').querySelector('.vt-graph')
      // Only works correctly when scrolled to top of page
      const oldScrollPosition = document.documentElement.scrollTop 
      document.documentElement.scrollTop = 0
      
      html2canvas(input, {
        useCORS: true
      })
        .then(canvas => {
            reimg.ReImg.fromCanvas(canvas).downloadPng(filename)
        })
      // Reset users scroll position after download
      document.documentElement.scrollTop = oldScrollPosition
    } 

    return (
      <>
        <Button size="medium" outlined onClick={()=>{ saveImage() }} ref={ref}>
            <Icon size="small"><img src={imgDownload} style={{height: '1rem'}} alt="Download Image Button" /></Icon>
            <span>Download Image</span>
        </Button>
      </>
    )
}

export default GraphImageDownloadButton