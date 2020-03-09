import React from 'react'

import {Content, Footer} from "rbx"

export const FooterContainer = () =>{

    return (
        <Footer>
            <Content textAlign="centered">
                <p>
                    Data sources: <a href="https://github.com/CSSEGISandData/COVID-19">Johns Hopkins CSSE</a>, <a href="https://www.who.int/emergencies/diseases/novel-coronavirus-2019/situation-reports">WHO</a>, <a href="https://www.cdc.gov/coronavirus/2019-ncov/index.html">CDC</a>, <a href="https://www.ecdc.europa.eu/en/geographical-distribution-2019-ncov-cases">ECDC</a>, <a href="http://www.nhc.gov.cn/xcs/yqtb/list_gzbd.shtml">NHC</a> and <a href="https://3g.dxy.cn/newh5/view/pneumonia?scene=2&clicktime=1579582238&enterid=1579582238&from=singlemessage&isappinstalled=0">DXY</a>
                </p>
                <p>
                    <strong><a href="https://github.com/pr3d4t0r/covidvu">COVIDvu GitHub</a></strong> Support by: <a href="https://cime.net">CIME</a>, <a href="https://mysticcoders.com">Mystic Coders</a> and <a href="https://farad.ai">Farad.ai</a>
                </p>
                <p>
                    We don't store cookies, so no cookie notice is provided.
                </p>
            </Content>
        </Footer>
    )
}