import React from 'react';
import VirusTrackLogo from '../images/virus-pngrepo-icon.png';

export const LogoElement = ({ size, url = false }) => (
  <div className={`${size} LogoElement`}>
    <img src={VirusTrackLogo} alt="VirusTrack" role="presentation" className="logomark" />
    <div className="logotype" title="Coronavirus COVID-19 Cases">
      <span>Virus</span>
      <span className="track">Track</span>
      {url && <span className="live">.LIVE</span> }
    </div>
  </div>
);

export default LogoElement;
