import React, { useEffect, useState } from 'react';

import { useDispatch } from 'react-redux';

import { useLocation } from 'react-router';

import ReactGA from 'react-ga';
import { useHandleHistory } from '../hooks/nav';
import { useGraphData } from '../hooks/graphData';

import { actions } from '../ducks/services';

import TwoGraphLayout from '../layouts/TwoGraphLayout';

import TabbedCompareGraphs from '../components/TabbedCompareGraphs';

import CheckboxRegionComponent from '../components/CheckboxRegionComponent';
import HeroElement from '../components/HeroElement';
import BoxWithLoadingIndicator from '../components/BoxWithLoadingIndicator';


export const ContinentalGraphContainer = ({ region = [], graph = 'Cases', showLogParam = false }) => {
  const dispatch = useDispatch();
  const { search } = useLocation();
  const handleHistory = useHandleHistory('/covid/continental');

  const [showLog, setShowLog] = useState(showLogParam);
  const [selectedContinents, setSelectedContinents] = useState(region);
  const [secondaryGraph, setSecondaryGraph] = useState(graph);

  const {
    confirmed, sortedConfirmed, deaths, mortality,
  } = useGraphData('continental');

  /**
     * Fetch all the data
     */
  useEffect(() => {
    dispatch(actions.fetchContinental());
  }, [dispatch]);

  // Select the Top 3 confirmed from list if nothing is selected
  useEffect(() => {
    if (sortedConfirmed && region.length === 0) {
      setSelectedContinents(sortedConfirmed.slice(0, 3).map((confirmed) => confirmed.region));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedConfirmed]);

  useEffect(() => {
    if (!search) {
      handleHistory(selectedContinents, secondaryGraph);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectedRegion = (regionList) => {
    setSelectedContinents(regionList);
    handleHistory(regionList, secondaryGraph, showLog);

    ReactGA.event({
      category: 'Region:Continental',
      action: `Changed selected regions to ${regionList.join(', ')}`,
    });
  };

  const handleSelectedGraph = (selectedGraph) => {
    setSecondaryGraph(selectedGraph);
    handleHistory(selectedContinents, selectedGraph, showLog);

    ReactGA.event({
      category: 'Region:Continental',
      action: `Changed selected graph to ${selectedGraph}`,
    });
  };

  const handleGraphScale = (logScale) => {
    setShowLog(logScale);
    handleHistory(selectedContinents, secondaryGraph, logScale);

    ReactGA.event({
      category: 'Region:Continental',
      action: `Changed graph scale to ${logScale ? 'logarithmic' : 'linear'}`,
    });
  };

  return (
    <>
      <HeroElement
        subtitle="Global"
        title={
          <>Coronavirus Cases by Continent</>
            }
        buttons={[
          { title: 'Cases By Country', location: '/covid' },
          { title: 'Cases By Continent', location: '/covid/continental' },
        ]}
      />
      <BoxWithLoadingIndicator hasData={sortedConfirmed}>
        <TwoGraphLayout>

          <CheckboxRegionComponent
            data={sortedConfirmed}
            selected={selectedContinents}
            handleSelected={(dataList) => handleSelectedRegion(dataList)}
            defaultSelected={region}
            showLog={showLog}
            parentRegion="Continental"
          />

          <TabbedCompareGraphs
            secondaryGraph={secondaryGraph}
            confirmed={confirmed}
            deaths={deaths}
            mortality={mortality}
            selected={selectedContinents}
            handleSelectedGraph={handleSelectedGraph}
            handleGraphScale={handleGraphScale}
            showLog={showLog}
          />

        </TwoGraphLayout>
      </BoxWithLoadingIndicator>
    </>
  );
};

export default ContinentalGraphContainer;
