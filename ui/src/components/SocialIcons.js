import React from 'react'

import faTwitter from '../images/fa-icon-twitter.svg'
import faFacebook from '../images/fa-icon-facebook.svg'
import faLinkedin from '../images/fa-icon-linkedin.svg'

export const SocialIcons = ({donate, size, style}) => (
  <div className={`social-icons ${size ? size : ''}`} style={style}>
    <div className='social-icons__icons'>
      <a href="https://twitter.com/covidvu" target="_blank" rel="noopener noreferrer"><img src={faTwitter} alt="Twitter @covidvu" /> <span className="network-title">Twitter</span></a>
      <a href="https://www.facebook.com/virustrack" target="_blank" rel="noopener noreferrer"><img src={faFacebook} alt="Facebook @covidvu" /> <span className="network-title">Facebook</span></a>
      <a href="https://www.linkedin.com/company/covidvu-contributors-team/" target="_blank" rel="noopener noreferrer"><img src={faLinkedin} alt="Twitter @covidvu" /> <span className="network-title">LinkedIn</span></a>
    </div>

    {donate && 
      <a className="button is-primary is-outlined" href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&amp;hosted_button_id=52U5RTY2YY3WS&amp;source=url" target="_blank" rel="noopener noreferrer">Donate</a>}
  
  </div>
  )

export default SocialIcons