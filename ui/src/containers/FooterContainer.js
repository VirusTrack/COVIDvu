import React, { useEffect } from 'react'

import { useInterval } from '../hooks/ui'

import { useDispatch, useSelector } from 'react-redux'
import { actions } from '../ducks/services'

import {Content, Footer, Tag, Level, Column} from "rbx"

import { CACHE_TIMER } from '../constants'

import CCSAByLogo from '../images/cc_sa.png'

import CookieConsent from "react-cookie-consent";

import moment from 'moment'

export const FooterContainer = () =>{

    const dispatch = useDispatch()

    const lastUpdate = useSelector(state => state.services.lastUpdate)

    useInterval(() => {
        dispatch(actions.fetchLastUpdate())
    }, CACHE_TIMER)

    useEffect(() => {
        dispatch(actions.fetchLastUpdate())
    }, [dispatch])

    return (
        <Footer>
            <Content textAlign="centered">
                { lastUpdate && 
                    <p>
                        <Tag color="primary">Last updated: {moment(lastUpdate).format('YYYY-MM-DD HH:mm:ss')}</Tag>
                    </p>
                }
            </Content>
            <Column.Group>
            
                <Column>
                    <p>
                        Follow us on Twitter <a href="https://twitter.com/covidvu" target="_new" rel="noopener noreferrer">@covidvu</a>
                    </p>
                    <p>
                        Data sources: <a href="https://github.com/CSSEGISandData/COVID-19" target="_new" rel="noopener noreferrer">Johns Hopkins CSSE</a>, <a href="https://bnonews.com/" target="_new" rel="noopener noreferrer">BNO News</a>, <a href="https://www.who.int/emergencies/diseases/novel-coronavirus-2019/situation-reports" target="_new" rel="noopener noreferrer">WHO</a>, <a href="https://www.cdc.gov/coronavirus/2019-ncov/index.html" target="_new" rel="noopener noreferrer">CDC</a>, <a href="https://www.ecdc.europa.eu/en/geographical-distribution-2019-ncov-cases" target="_new" rel="noopener noreferrer">ECDC</a>, <a href="http://www.nhc.gov.cn/xcs/yqtb/list_gzbd.shtml" target="_new" rel="noopener noreferrer">NHC</a> and <a href="https://3g.dxy.cn/newh5/view/pneumonia?scene=2&clicktime=1579582238&enterid=1579582238&from=singlemessage&isappinstalled=0" target="_new" rel="noopener noreferrer">DXY</a>
                    </p>
                    <p>
                        <strong><a href="https://github.com/pr3d4t0r/covidvu" target="_new" rel="noopener noreferrer">COVIDvu GitHub</a></strong> Support by: <a href="https://cime.net" target="_new" rel="noopener noreferrer">CIME</a>, <a href="https://mysticcoders.com" target="_new" rel="noopener noreferrer">Mystic Coders</a> and <a href="https://farad.ai" target="_new" rel="noopener noreferrer">Farad.ai</a>
                    </p>
                    <p>
                        We don't store cookies, so no cookie notice is provided.
                    </p>

                </Column>
                <Column>
                    <p>                    
                        <img src={CCSAByLogo} /> <br />
                        <em>Except where otherwise noted, content on this site is licensed under 
                            the <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_new" rel="noopener noreferrer">Creative Commons Attribution-ShareAlike 4.0 International license.</a>
                            by the COVIDvu Open Source Virus Tracking Team.
                            </em>
                    </p>
                </Column>

                <CookieConsent
                    location="bottom"
                    buttonText="Accept"
                    cookieName="covid-cookie-consent"
                    style={{ background: "#2B373B" }}
                    buttonStyle={{ color: "#4e503b", fontSize: "13px" }}
                    expires={150}
                >
                    This website uses cookies to enhance the user experience.{" "}
                </CookieConsent>

            </Column.Group>


        </Footer>
    )
}
