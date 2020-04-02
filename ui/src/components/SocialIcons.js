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
    <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top" className="paypal-form">
      <input type="hidden" name="cmd" value="_s-xclick" />
      <input type="hidden" name="hosted_button_id" value="52U5RTY2YY3WS" />
      <input type="button" name="submit" title="PayPal - The safer, easier way to pay online!" value="Donate" />
      <img alt="" border="0" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1" />
    </form> }
  
  </div>
  )

export default SocialIcons