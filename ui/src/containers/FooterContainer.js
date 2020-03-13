import React, { useEffect } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { actions } from '../ducks/services'

import {Content, Footer, Tag} from "rbx"

export const FooterContainer = () =>{

    const dispatch = useDispatch()

    const lastUpdate = useSelector(state => state.services.lastUpdate)

    useEffect(() => {
        dispatch(actions.fetchLastUpdate())
    }, [dispatch])

    return (
        <Footer>
            <Content textAlign="centered">
                { lastUpdate && 
                    <p>
                        <Tag color="primary">Last updated: {lastUpdate}</Tag>
                    </p>
                }
                <p>
                    Data sources: <a href="https://github.com/CSSEGISandData/COVID-19" target="_new">Johns Hopkins CSSE</a>, <a href="https://www.who.int/emergencies/diseases/novel-coronavirus-2019/situation-reports" target="_new">WHO</a>, <a href="https://www.cdc.gov/coronavirus/2019-ncov/index.html" target="_new">CDC</a>, <a href="https://www.ecdc.europa.eu/en/geographical-distribution-2019-ncov-cases" target="_new">ECDC</a>, <a href="http://www.nhc.gov.cn/xcs/yqtb/list_gzbd.shtml" target="_new">NHC</a> and <a href="https://3g.dxy.cn/newh5/view/pneumonia?scene=2&clicktime=1579582238&enterid=1579582238&from=singlemessage&isappinstalled=0" target="_new">DXY</a>
                </p>
                <p>
                    <strong><a href="https://github.com/pr3d4t0r/covidvu" target="_new">COVIDvu GitHub</a></strong> Support by: <a href="https://cime.net" target="_new">CIME</a>, <a href="https://mysticcoders.com" target="_new">Mystic Coders</a> and <a href="https://farad.ai" target="_new">Farad.ai</a>
                </p>
                <p>
                    We don't store cookies, so no cookie notice is provided.
                </p>
            </Content>
        </Footer>
    )
}