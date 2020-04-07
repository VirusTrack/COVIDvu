import React, { useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import {
  Container, Footer, Tag, Column,
} from 'rbx';
import CookieConsent from 'react-cookie-consent';
import moment from 'moment';
import { useInterval } from '../hooks/ui';

import { actions } from '../ducks/services';


import { CACHE_TIMER } from '../constants';

import ccBy from '../images/cc-by.svg';
import ccSa from '../images/cc-sa.svg';


import SocialIcons from '../components/SocialIcons';

export const FooterContainer = () => {
  const dispatch = useDispatch();

  const lastUpdate = useSelector((state) => state.services.lastUpdate);

  const [currentLastUpdate, setCurrentLastUpdate] = useState(lastUpdate);

  useInterval(() => {
    console.log(`Fetching latest update... ${new Date().getTime()}`);
    dispatch(actions.fetchLastUpdate());
  }, CACHE_TIMER);

  useEffect(() => {
    dispatch(actions.fetchLastUpdate());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    if (currentLastUpdate && lastUpdate !== currentLastUpdate) {
      dispatch(actions.clearGraphs());
      dispatch(actions.clearGraphs());
      dispatch(actions.fetchGlobal());
      dispatch(actions.fetchUSStates());
      dispatch(actions.fetchUSRegions());
      dispatch(actions.fetchContinental());
      dispatch(actions.fetchTop10Countries({
        excludeChina: true,
      }));
      dispatch(actions.fetchTotalGlobalStats());
      dispatch(actions.fetchGlobalPredictions());
      dispatch(actions.fetchTop10USStates());
      dispatch(actions.fetchTotalUSStatesStats());
    } else {
      setCurrentLastUpdate(lastUpdate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastUpdate]);

  return (
    <>
      <Footer>
        <Container>
          <Column.Group>
            <Column>

              <p>
                Data sources:
                &nbsp;
                <br />
                <a href="https://github.com/CSSEGISandData/COVID-19" target="_new" rel="noopener noreferrer">Johns Hopkins CSSE</a>
                ,&nbsp;
                <a href="https://bnonews.com/" target="_new" rel="noopener noreferrer">BNO News</a>
                ,&nbsp;
                <a href="https://www.who.int/emergencies/diseases/novel-coronavirus-2019/situation-reports" target="_new" rel="noopener noreferrer">WHO</a>
                ,&nbsp;
                <a href="https://www.cdc.gov/coronavirus/2019-ncov/index.html" target="_new" rel="noopener noreferrer">CDC</a>
                ,&nbsp;
                <a href="https://www.csbs.org/information-covid-19-coronavirus" target="_new" rel="noopener noreferrer">CSBS</a>
                ,&nbsp;
                <a href="https://www.ecdc.europa.eu/en/geographical-distribution-2019-ncov-cases" target="_new" rel="noopener noreferrer">ECDC</a>
                ,&nbsp;
                <a href="http://www.nhc.gov.cn/xcs/yqtb/list_gzbd.shtml" target="_new" rel="noopener noreferrer">NHC</a>
                &nbsp;
                and
                &nbsp;
                <a href="https://3g.dxy.cn/newh5/view/pneumonia?scene=2&clicktime=1579582238&enterid=1579582238&from=singlemessage&isappinstalled=0" target="_new" rel="noopener noreferrer">DXY</a>
              </p>

              <p>
                We welcome information about data sources, suggestions, and general feedback via
                &nbsp;
                <a href="mailto:feedback@virustrack.live">feedback@virustrack.live</a>
              </p>

              <p>
                <strong><a href="https://github.com/VirusTrack/covidvu" target="_new" rel="noopener noreferrer">COVIDvu GitHub</a></strong>
                &nbsp;
                Support by:
                <br />
                <a href="https://cime.net" target="_new" rel="noopener noreferrer">CIME</a>
                ,&nbsp;<a href="https://mysticcoders.com" target="_new" rel="noopener noreferrer">Mystic Coders</a>                
                &nbsp;and <a href="https://farad.ai" target="_new" rel="noopener noreferrer">Farad.ai</a>
              </p>


              <p>
                { lastUpdate
                                && (
                                <Tag>
                                  Last updated:&nbsp;{moment(lastUpdate).format('YYYY-MM-DD HH:mm:ss')}
                                </Tag>
                                )}
                <a href="/privacy" rel="noopener noreferrer">Privacy Policy</a>

              </p>

            </Column>
            <Column align="left">
              <p>
                <img src={ccBy} style={{ height: '2.4rem', marginRight: '.5rem' }} alt="Creative Commons Attribution-ShareAlike 4.0 International license" />
                <img src={ccSa} style={{ height: '2.4rem' }} alt="Creative Commons Attribution-ShareAlike 4.0 International license" />
                {' '}
                <br />
                <em>
                  Except where otherwise noted, content on this site is licensed under
                  the <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_new" rel="noopener noreferrer">Creative Commons Attribution-ShareAlike 4.0 International license </a>
                  by the COVIDvu Open Source Virus Tracking Team.
                </em>
              </p>

              <p>
                Stay up to date:
              </p>
              <SocialIcons size="large" donate style={{ marginTop: '.5rem' }} />
            </Column>


          </Column.Group>

        </Container>
      </Footer>
      <CookieConsent
        location="bottom"
        buttonText="Accept"
        cookieName="covid-cookie-consent"
        expires={150}
      >
        This website uses cookies to enhance the user experience.
        {' '}
      </CookieConsent>
    </>
  );
};

export default FooterContainer;
