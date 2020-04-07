import React, { useState } from 'react';

import numeral from 'numeral';

import {
  Select, Level, Title, Generic, Table, Tab,
} from 'rbx';

import { ColumnSortIcon } from './ColumnSortIcon';

import { CountyBarGraph } from './CountyBarGraph';

import { US_STATES_WITH_ABBREVIATION } from '../constants';

export const USCountiesStatsTable = ({
  filterRegion = 'NY', statsForGraph, redirectToExternalLink, isExternalLinkAvailable, renderDisplay, onSelectedFilter, sort, onSort,
}) => {
  const [selectedState, setSelectedState] = useState(filterRegion);

  const handleChange = (event) => {
    const newRegion = event.target.value;

    setSelectedState(newRegion);
    onSelectedFilter(newRegion);
  };

  const [selectedView, setSelectedView] = useState('Graph');

  return (
    <>
      <Level style={{
        marginBottom: 0, marginTop: 0, paddingTop: 0, paddinBottom: 0,
      }}
      >
        <Level.Item>
          <Select.Container>
            <Select value={selectedState} onChange={handleChange}>
              <Select.Option key="" value="">Select a State</Select.Option>

              {Object.keys(US_STATES_WITH_ABBREVIATION).map((stateName) => (
                <Select.Option key={stateName} value={US_STATES_WITH_ABBREVIATION[stateName]}>{stateName}</Select.Option>
              ))}
            </Select>
          </Select.Container>
        </Level.Item>
      </Level>

      <Tab.Group size="large" kind="boxed">
        <Tab active={selectedView === 'Table'} onClick={() => { setSelectedView('Table'); }}>Table</Tab>
        <Tab active={selectedView === 'Graph'} onClick={() => { setSelectedView('Graph'); }}>Graph</Tab>
      </Tab.Group>

      {selectedView === 'Table'
            && (
            <div className="table-container">
              <Table fullwidth hoverable>
                <Table.Head>
                  <Table.Row>
                    <Table.Heading>
                      Region
                    </Table.Heading>
                    <Table.Heading onClick={() => { onSort('confirmed'); }} style={{ cursor: 'pointer' }}>
                      Total Cases
                      {sort === 'confirmed'
                                    && <ColumnSortIcon direction="desc" />}
                    </Table.Heading>
                    <Table.Heading onClick={() => { onSort('deaths'); }} style={{ cursor: 'pointer' }}>
                      Deaths
                      {sort === 'deaths'
                                    && <ColumnSortIcon direction="desc" />}
                    </Table.Heading>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  { statsForGraph ? statsForGraph.map((stat, idx) => (
                    <Table.Row key={idx}>
                      <Table.Cell>
                        <Generic as="a" tooltipPosition="right" onClick={() => { redirectToExternalLink(stat.region); }} tooltip={isExternalLinkAvailable(stat.region) ? null : 'No external link for region yet'} textColor={isExternalLinkAvailable(stat.region) ? 'link' : 'black'}>{renderDisplay(stat.region)}</Generic>
                      </Table.Cell>
                      <Table.Cell>
                        <Title size={5}>{numeral(stat.confirmed).format('0,0')}</Title>
                      </Table.Cell>
                      <Table.Cell>
                        <Title size={5}>{numeral(stat.deaths).format('0,0')}</Title>
                      </Table.Cell>
                    </Table.Row>
                  )) : (
                    <Table.Row>
                      <Table.Cell>
                        Loading...
                            </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table>
            </div>
            )}
      <>
        {selectedView === 'Graph'
                && <CountyBarGraph filterRegion={filterRegion} statsForGraph={statsForGraph} />}
      </>
    </>
  );
};

export default USCountiesStatsTable;
