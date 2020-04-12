import React from 'react'

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

export const ShareButtons = ({title, shareUrl}) => (
    <>
        <FacebookShareButton url={shareUrl}>
            <FacebookIcon size={26} style={{ borderRadius: '.4rem' }} />
        </FacebookShareButton>
            &nbsp;
        <TwitterShareButton
            url={shareUrl}
            title={title}>
                <TwitterIcon size={26} style={{ borderRadius: '.4rem' }} />
        </TwitterShareButton>
            &nbsp;
        <RedditShareButton 
            url={shareUrl} 
            title={title}>
                <RedditIcon size={26} style={{ borderRadius: '.4rem' }} />
        </RedditShareButton>
            &nbsp;
        <WhatsappShareButton 
            url={shareUrl} 
            title={title}>
                <WhatsappIcon size={26} style={{ borderRadius: '.4rem' }} />
        </WhatsappShareButton>
    </>    
)

export default ShareButtons