import React, { useState, useEffect } from 'react'

import { Icon, Button } from 'rbx'
import { CSVDownload } from 'react-csv'
import imgDownload from '../images/fa-icon-download.svg'


export const GraphDownloadButton = ({ data }) => {
  const [downloadCsv, setDownloadCsv] = useState(false)

  useEffect(() => {
    if (downloadCsv) {
      setDownloadCsv(false)
    }
  }, [downloadCsv])

  return (

    <>
      { downloadCsv

          && <CSVDownload data={data.data} headers={data.headers} target="_blank" />}
      <Button size="medium" outlined onClick={() => { setDownloadCsv(true) }}>
        <Icon size="small"><img src={imgDownload} style={{ height: '1rem' }} alt="Download CSV Icon" /></Icon>
        <span>Download CSV</span>
      </Button>
    </>
  )
}

export default GraphDownloadButton
