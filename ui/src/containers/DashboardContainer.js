import React, { useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { useHistory } from 'react-router';
import {
  Generic, Tag, Title, Level, Heading, Container, Button, Box, Column,
} from 'rbx';
import numeral from 'numeral';
import moment from 'moment-timezone';
import ReactGA from 'react-ga';
import store from 'store2';
import { useClientCountry, useChangePageTitle } from '../hooks/ui';


import { actions } from '../ducks/services';


import GraphWithLoader from '../components/GraphWithLoader';
import HeroElement from '../components/HeroElement';
import LogoElement from '../components/LogoElement';

import NewsletterModal from '../components/NewsletterModal';

import { TERMS } from '../constants/dictionary';
import { DASHBOARD_GRAPH_SCALE_KEY, NEWSLETTER_SIGNUP_KEY } from '../constants';

import GraphControls from '../components/GraphControls';


import globeImg from '../images/fa-icon-globe.svg';
import usflagImg from '../images/fa-icon-usflag.svg';


export const DashboardContainer = ({ showLogParam = false }) => {
  const dispatch = useDispatch();
  const history = useHistory();

  const changePageTitle = useChangePageTitle();

  const clientCountry = useClientCountry();
  const [showLog, setShowLog] = useState(showLogParam);
  // const graphControlsAlign = 'center'

  // const [tzGuess, setTzGuess] = useState(moment.tz.guess())

  useEffect(() => {
    dispatch(actions.fetchTop10Countries({
      excludeChina: true,
    }));
    dispatch(actions.fetchTotalGlobalStats());

    dispatch(actions.fetchTop10USStates());
    dispatch(actions.fetchTotalUSStatesStats());

    dispatch(actions.fetchUSRegions());
    // dispatch(actions.fetchContinental())

    dispatch(actions.fetchGlobal());

    if (store.get(DASHBOARD_GRAPH_SCALE_KEY)) {
      setShowLog(store.get(DASHBOARD_GRAPH_SCALE_KEY));
    }
  }, [dispatch]);

  const lastUpdate = useSelector((state) => state.services.lastUpdate);

  useEffect(() => {
    dispatch(actions.fetchLastUpdate());
  }, [dispatch]);

  const globalTop10 = useSelector((state) => state.services.globalTop10);
  const globalNamesTop10 = useSelector((state) => state.services.globalNamesTop10);
  const globalStats = useSelector((state) => state.services.totalGlobalStats);

  const globalConfirmed = useSelector((state) => state.services.global.confirmed);

  const usStatesTop10 = useSelector((state) => state.services.usStatesTop10);
  const usStateNamesTop10 = useSelector((state) => state.services.usStateNamesTop10);
  const usStatesStats = useSelector((state) => state.services.totalUSStatesStats);

  const confirmedUSRegions = useSelector((state) => state.services.usRegions.confirmed);


  useEffect(() => {
    if (globalStats) {
      changePageTitle(`Coronavirus Update ${numeral(globalStats.confirmed).format('0,0')} Cases and ${numeral(globalStats.deaths).format('0,0')} Deaths from COVID-19 Virus Pandemic | VirusTrack.live`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalStats]);


  const renderChangeDifference = (value) => {
    const greenColor = { color: 'hsl(188, 80%, 38%)' };
    const redColor = { color: 'hsl(5, 87%, 70%)' };

    const colorBasedOnChange = value >= 0 ? redColor : greenColor;

    const renderedValue = value >= 0 ? numeral(value).format('+0,0') : '-';

    return (
      <Title as="p" style={colorBasedOnChange}>{renderedValue}</Title>
    );
  };

  const handleGraphScale = (logScale) => {
    setShowLog(logScale);
    store.set(DASHBOARD_GRAPH_SCALE_KEY, logScale);

    ReactGA.event({
      category: 'Dashboard',
      action: `Changed graph scale to ${logScale ? 'logarithmic' : 'linear'}`,
    });
  };

  if (!clientCountry) {
    return (
      <h1>Loading</h1>
    );
  }

  return (
    <>
      <HeroElement
        title={(
          <>
            Coronavirus
            <br />
            {' '}
            COVID-19 Cases
          </>
            )}
        buttons={[
          { title: 'Global', location: '/covid' },
          { title: 'United States', location: '/covid/us' },
        ]}
        updated={lastUpdate
                && (
                <Tag as="p">
                  Last updated:&nbsp;{moment(lastUpdate).format('YYYY-MM-DD HH:mm:ss')}
                </Tag>
                )}
      >
        { !store.get(NEWSLETTER_SIGNUP_KEY)
                && <NewsletterModal style={{ marginLeft: 'auto', maxWidth: '40rem' }} className="hide-on-mobile" />}
      </HeroElement>

      <Box>
        <Title size={2}>
          <LogoElement size="small" />
          <img src={globeImg} alt="" />
          Global Coronavirus Totals
        </Title>
        <Column.Group breakpoint="desktop" gapless className="separated">
          <Column narrow>

            <Container className="statistics">
              <Level>
                <Level.Item textAlign="centered">
                  <div>
                    <Heading>Total Cases</Heading>
                    <Title as="p" style={{ marginBottom: 0 }}>{numeral(globalStats.confirmed).format('0,0')}</Title>
                    <Heading>
                        As of&nbsp;{moment(lastUpdate).format('YYYY-MM-DD')}
                      </Heading>
                  </div>
                </Level.Item>

              </Level>

              <Level breakpoint="mobile">
                <Level.Item textAlign="centered">
                  <div>
                    <Heading>Total Deaths</Heading>
                    <Title as="p">{numeral(globalStats.deaths).format('0,0')}</Title>
                  </div>
                </Level.Item>
                <Level.Item textAlign="centered">
                  <div>
                    <Heading tooltip="Calculated from beginning of day GMT+0">New Cases (as of today)</Heading>
                    { renderChangeDifference(globalStats.newConfirmed)}
                  </div>
                </Level.Item>
              </Level>

              <Level breakpoint="mobile">
                <Level.Item textAlign="centered">
                  <div>
                    <Heading tooltip={TERMS.CFR_DEFINITION}>Case Fatality Rate</Heading>
                    <Title as="p">{numeral(globalStats.mortality).format('0.0 %')}</Title>
                  </div>
                </Level.Item>
                <Level.Item textAlign="centered">
                  <div>
                    <Heading tooltip="Calculated from beginning of day GMT+0">New Deaths (as of today)</Heading>
                    { renderChangeDifference(globalStats.newDeaths)}
                  </div>
                </Level.Item>
              </Level>
            </Container>
          </Column>

          <Column>
            <Container className="chart" id="clientCountry">
              <Title size={2} align="center">
                <Heading align="center">Confirmed Cases</Heading>
                {clientCountry.country === 'US' ? 'United States' : clientCountry.country}
              </Title>

              <Generic style={{ marginBottom: '1rem' }}>
                <GraphControls
                  scale
                  showLog={showLog}
                  handleGraphScale={handleGraphScale}
                  secondaryGraph={globalConfirmed}
                  centered
                  htmlId="clientCountry"
                />
              </Generic>
              <GraphWithLoader
                graphName="Cases"
                secondaryGraph="Cases"
                graph={globalConfirmed}
                showLog={showLog}
                selected={[clientCountry.country]}
                style={{ width: '100%', height: '100%' }}
              />

            </Container>
          </Column>

          <Column>
            <Container className="chart" id="top10Country">
              <Title size={2} align="center">
                <Heading align="center">Top 10 Confirmed</Heading>
                Cases by Country
              </Title>

              <Generic style={{ paddingBottom: '1rem' }}>
                <GraphControls
                  scale
                  showLog={showLog}
                  handleGraphScale={handleGraphScale}
                  secondaryGraph={globalTop10}
                  centered
                  htmlId="top10Country"
                />
              </Generic>
              <GraphWithLoader
                graphName="Cases"
                secondaryGraph="Cases"
                graph={globalTop10}
                showLog={showLog}
                selected={globalNamesTop10}
              />

            </Container>
          </Column>

        </Column.Group>

        <Button.Group align="center">
          <Button size="large" color="primary" onClick={() => { dispatch(actions.clearGraphs()); history.push('/covid'); }}>Compare Country Stats</Button>
          <Button size="large" color="primary" onClick={() => { dispatch(actions.clearGraphs()); history.push('/covid/continental'); }}>Compare Continental Stats</Button>
        </Button.Group>
      </Box>


      <Box>

        <Title size={2}>
          <LogoElement size="small" />
          <img src={usflagImg} alt="" />
          United States Coronavirus Totals
        </Title>
        <Column.Group gapless breakpoint="desktop" className="separated">
          <Column narrow>
            <Container className="statistics">
              <Level>
                <Level.Item textAlign="centered">
                  <div>
                    <Heading>Total Cases</Heading>
                    <Title as="p" style={{ marginBottom: 5 }}>{numeral(usStatesStats.confirmed).format('0,0')}</Title>
                    <Heading>
                        As of&nbsp;{moment(lastUpdate).format('YYYY-MM-DD')}
                      </Heading>
                  </div>
                </Level.Item>

              </Level>

              <Level breakpoint="mobile">
                <Level.Item textAlign="centered">
                  <div>
                    <Heading>Total Deaths</Heading>
                    <Title as="p">{numeral(usStatesStats.deaths).format('0,0')}</Title>
                  </div>
                </Level.Item>
                <Level.Item textAlign="centered">
                  <div>
                    <Heading tooltip="Calculated from beginning of day GMT+0">New Cases (as of today)</Heading>
                    { renderChangeDifference(usStatesStats.newConfirmed)}
                  </div>
                </Level.Item>
              </Level>

              <Level breakpoint="mobile">
                <Level.Item textAlign="centered">
                  <div>
                    <Heading tooltip={TERMS.CFR_DEFINITION}>Case Fatality Rate</Heading>
                    <Title as="p">{numeral(usStatesStats.mortality).format('0.0 %')}</Title>
                  </div>
                </Level.Item>

                <Level.Item textAlign="centered">
                  <div>
                    <Heading tooltip="Calculated from beginning of day GMT+0">New Deaths (as of today)</Heading>
                    { renderChangeDifference(usStatesStats.newDeaths)}
                  </div>
                </Level.Item>
              </Level>

            </Container>
          </Column>

          <Column className="chart" id="top10USState">
            <Title size={2} align="center">
              <Heading>Top 10 Confirmed</Heading>
              Cases by State
            </Title>

            <Generic style={{ marginBottom: '1rem' }}>
              <GraphControls
                scale
                showLog={showLog}
                handleGraphScale={handleGraphScale}
                secondaryGraph={usStateNamesTop10}
                centered
                htmlId="top10USState"
              />
            </Generic>
            <GraphWithLoader
              graphName="Cases"
              secondaryGraph="Cases"
              graph={usStatesTop10}
              showLog={showLog}
              selected={usStateNamesTop10}
            />
          </Column>

          <Column className="chart" id="topUSRegion">
            <Title size={2} align="center">
              <Heading>Top Coronavirus Cases</Heading>
              By U.S. Region
            </Title>

            <Generic style={{ marginBottom: '1rem' }}>
              <GraphControls
                scale
                showLog={showLog}
                handleGraphScale={handleGraphScale}
                secondaryGraph={confirmedUSRegions}
                centered
                htmlId="topUSRegion"
              />
            </Generic>
            <GraphWithLoader
              graphName="Cases"
              secondaryGraph="Cases"
              graph={confirmedUSRegions}
              showLog={showLog}
              selected={['Midwest', 'Northeast', 'South', 'West']}
            />

          </Column>
        </Column.Group>

        <Button.Group align="center">
          <Button size="large" color="primary" onClick={() => { dispatch(actions.clearGraphs()); history.push('/covid/us'); }}>Compare U.S. States</Button>
          <Button size="large" color="primary" onClick={() => { dispatch(actions.clearGraphs()); history.push('/covid/us/regions'); }}>Compare U.S. Regions</Button>
        </Button.Group>
      </Box>

    </>
  );
};

export default DashboardContainer;
