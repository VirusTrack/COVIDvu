import React from 'react'

import numeral from 'numeral'

import { Title, Generic, Table } from 'rbx'

import { ColumnSortIcon } from './ColumnSortIcon'

export const USStatsTable = ({statsForGraph, redirectToExternalLink, isExternalLinkAvailable, renderDisplay, sort, onSort}) => {

    return (

        <div className="table-container">
        <Table fullwidth hoverable>
            <Table.Head>
                <Table.Row>
                    <Table.Heading>
                        Region
                    </Table.Heading>
                    <Table.Heading onClick={() => { onSort('confirmed') }} style={{ cursor: 'pointer'}}>
                        Total Cases
                        {sort === 'confirmed' &&
                            <ColumnSortIcon direction='desc' />
                        }
                    </Table.Heading>
                    <Table.Heading>
                        New Cases
                    </Table.Heading>
                    <Table.Heading tooltipPosition="bottom" tooltip="Total not-for-profit beds in each state">
                        Total Hospital Beds
                    </Table.Heading>
                    <Table.Heading onClick={() => { onSort('deaths')}} style={{ cursor: 'pointer'}}>
                        Deaths
                        {sort === 'deaths' &&
                            <ColumnSortIcon direction='desc' />
                        }
                    </Table.Heading>
                    <Table.Heading>
                        New Deaths
                    </Table.Heading>
                    <Table.Heading onClick={() => { onSort('mortality')}} style={{ cursor: 'pointer'}}>
                        Mortality Rate
                        {sort === 'mortality' &&
                            <ColumnSortIcon direction='desc' />
                        }
                    </Table.Heading>
                </Table.Row>
            </Table.Head>
            <Table.Body>
                { statsForGraph ? statsForGraph.map((stat, idx) => (
                <Table.Row key={idx}>
                    <Table.Cell>                        
                        <Generic as="a" tooltipPosition="right" onClick={()=>{ redirectToExternalLink(stat.region) }} tooltip={isExternalLinkAvailable(stat.region) ? null : "No external link for region yet"} textColor={isExternalLinkAvailable(stat.region) ? "link": "black"}>{renderDisplay(stat.region)}</Generic>
                    </Table.Cell>
                    <Table.Cell>
                        <Title size={5}>{numeral(stat.confirmed).format('0,0')}</Title>
                    </Table.Cell>
                    <Table.Cell>
                        <Title size={5}>{numeral(stat.confirmedDayChange < 0 ? 0 : stat.confirmedDayChange).format('+0,0')} ({stat.confirmedDayChange < 0 ? "0%" : numeral(stat.confirmedDayChange / stat.confirmed).format('0%')})</Title>
                    </Table.Cell>
                    <Table.Heading>
                        <Title size={5}>{stat.hospitalBeds > 0 ? numeral(stat.hospitalBeds).format('0,0') : '-'}</Title>
                    </Table.Heading>
                    <Table.Cell>
                        <Title size={5}>{numeral(stat.deaths).format('0,0')}</Title>
                    </Table.Cell>
                    <Table.Cell>
                        <Title size={5}>{numeral(stat.deathsDayChange < 0 ? 0 : stat.deathsDayChange).format('+0,0')} ({stat.deathsDayChange < 0 ? "0%" : numeral(stat.deathsDayChange / stat.deaths).format('0%')})</Title>
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
}

export default USStatsTable