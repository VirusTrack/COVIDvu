import React from 'react'

import numeral from 'numeral'

import { Title, Generic, Table } from 'rbx'

export const GlobalStatsTable = ({statsForGraph, redirectToExternalLink, isExternalLinkAvailable, renderDisplay}) => {
    return (

        <div className="table-container">
            <Table fullwidth hoverable>
                <Table.Head>
                    <Table.Row>
                        <Table.Heading>
                            Region
                        </Table.Heading>
                        <Table.Heading>
                            Total Cases
                        </Table.Heading>
                        <Table.Heading>
                            New Cases
                        </Table.Heading>
                        <Table.Heading>
                            Deaths
                        </Table.Heading>
                        <Table.Heading>
                            New Deaths
                        </Table.Heading>
                        <Table.Heading>
                            Mortality Rate
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
                            <Title size={5}>{numeral(stat.confirmedDayChange < 0 ? 0 : stat.confirmedDayChange).format('+0,0')}</Title>
                        </Table.Cell>
                        <Table.Cell>
                            <Title size={5}>{numeral(stat.deaths).format('0,0')}</Title>
                        </Table.Cell>
                        <Table.Cell>
                            <Title size={5}>{numeral(stat.deathsDayChange < 0 ? 0 : stat.deathsDayChange).format('+0,0')}</Title>
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

export default GlobalStatsTable