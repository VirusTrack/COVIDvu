import React from 'react'

import { Icon, Button } from 'rbx'
import imgDownload from '../images/fa-icon-download.svg'

export const GraphDownloadButton = ({}) => {

    return (
      <Button size="medium" outlined>
        <Icon size="small"><img src={imgDownload} style={{height: '1rem'}} /></Icon>
        <span>Download CSV</span>
      </Button>
    )
}

export default GraphDownloadButton