import React from 'react'
import VirusTrackLogo from '../images/virus-pngrepo-icon.png'

export const LogoElement = ({size}) => {
    return (
        <div class={`${size} LogoElement`}>
            <img src={VirusTrackLogo} alt="VirusTrack" role="presentation" className="logomark"/>
            <div title="Coronavirus COVID-19 Cases"><span>Virus</span>Track</div>
        </div>
    )
}

export default LogoElement