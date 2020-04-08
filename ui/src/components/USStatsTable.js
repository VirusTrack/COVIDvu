import React from 'react'

import numeral from 'numeral'
import { Title, Table } from 'rbx'
import { TERMS } from '../constants/dictionary'

import { SortedTableHeading } from './SortedTableHeading'
import ExternalLink from '../components/ExternalLink'
import { renderDisplay } from '../utils'

export const USStatsTable = ({
  statsForGraph, sort, onSort,
}) => (

  <div className="table-container">
    <Table fullwidth hoverable>
      <Table.Head>
        <Table.Row>
          <Table.Heading>
            Region
          </Table.Heading>
          <SortedTableHeading 
              onSort={() => {onSort('confirmed')}} 
              heading="Total Cases" 
              selectedSort={sort === 'confirmed'} 
              direction='desc' 
          />
          <Table.Heading>
            New Cases
          </Table.Heading>
          <Table.Heading tooltipPosition="bottom" tooltip="Total not-for-profit beds in each state">
            Total Hospital Beds
          </Table.Heading>
          <SortedTableHeading 
              onSort={() => {onSort('deaths')}} 
              heading="Deaths" 
              selectedSort={sort === 'deaths'} 
              direction='desc' 
          />
          <Table.Heading>
            New Deaths
          </Table.Heading>
          <SortedTableHeading 
              onSort={() => {onSort('mortality')}} 
              heading="Case Fatality Rate" 
              selectedSort={sort === 'mortality'} 
              direction='desc' 
              tooltipPosition="bottom"
              tooltip={TERMS.CFR_DEFINITION}
          />
        </Table.Row>
      </Table.Head>
      <Table.Body>
        { statsForGraph ? statsForGraph.map((stat, idx) => (
          <Table.Row key={idx}>
            <Table.Cell>
                <ExternalLink 
                    externalKey={stat.region}
                    category="Stats:US" 
                    linkText={renderDisplay(stat.region)} 
                    tooltipText="No external link for region yet" 
                />
            </Table.Cell>
            <Table.Cell>
              <Title size={5}>{numeral(stat.confirmed).format('0,0')}</Title>
            </Table.Cell>
            <Table.Cell>
              <Title size={5}>
                {numeral(stat.confirmedDayChange < 0 ? 0 : stat.confirmedDayChange).format('+0,0')}
                {' '}
                (
                {stat.confirmedDayChange < 0 ? '0%' : numeral(stat.confirmedDayChange / stat.confirmed).format('0%')}
                )
              </Title>
            </Table.Cell>
            <Table.Heading>
              <Title size={5}>{stat.hospitalBeds > 0 ? numeral(stat.hospitalBeds).format('0,0') : '-'}</Title>
            </Table.Heading>
            <Table.Cell>
              <Title size={5}>{numeral(stat.deaths).format('0,0')}</Title>
            </Table.Cell>
            <Table.Cell>
              <Title size={5}>
                {numeral(stat.deathsDayChange < 0 ? 0 : stat.deathsDayChange).format('+0,0')}
                {' '}
                (
                {stat.deathsDayChange < 0 ? '0%' : numeral(stat.deathsDayChange / stat.deaths).format('0%')}
                )
              </Title>
            </Table.Cell>
            <Table.Cell>
              <Title size={6}>{numeral(stat.mortality).format('0.0 %')}</Title>
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
)

export default USStatsTable
