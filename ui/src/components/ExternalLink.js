import React from 'react'
import ReactGA from 'react-ga'

import { Generic } from 'rbx'
import { EXTERNAL_URLS } from '../constants'

const isExternalLinkAvailable = (externalKey) => Object.prototype.hasOwnProperty.call(EXTERNAL_URLS, externalKey)

const redirectToExternalLink = (externalKey, category) => {
  if (Object.prototype.hasOwnProperty.call(EXTERNAL_URLS, externalKey)) {
    window.open(EXTERNAL_URLS[externalKey], '_blank')
    ReactGA.event({
      category: category,
      action: `Redirecting to external link to ${EXTERNAL_URLS[externalKey]}`,
    })
  }
}

export const ExternalLink = ({externalKey, category, linkText, tooltipText, tooltipPosition='right'}) => (

    <Generic as="a" tooltipPosition={tooltipPosition}
        tooltip={isExternalLinkAvailable(externalKey) ? null : tooltipText} 
        onClick={() => { redirectToExternalLink(externalKey, category) }} 
        textColor={isExternalLinkAvailable(externalKey) ? 'link' : 'black'}>

                {linkText}

    </Generic>

)

export default ExternalLink