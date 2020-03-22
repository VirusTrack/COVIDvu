import React from 'react'

import numeral from 'numeral'

import { Select, Title, Generic, Table } from 'rbx'

export const USCountiesStatsTable = ({statsForGraph, redirectToExternalLink, isExternalLinkAvailable, renderDisplay}) => {
    return (

        // <Select.Container>
        // <Select value={selectedState} onChange={onChange}>
        //     {data.map(element => (
        //         <Select.Option key={element.region} value={element.region}>{renderDisplay(`${element.region} ${element.stats}`)}</Select.Option>
        //     ))}
        //     </Select>
        // </Select.Container>

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
                        Deaths
                    </Table.Heading>
                </Table.Row>
            </Table.Head>
            <Table.Body>
                { (statsForGraph && statsForGraph.length > 0) ? statsForGraph.map((stat, idx) => (
                <Table.Row key={idx}>
                    <Table.Cell>                        
                        <Generic as="a" tooltipPosition="right" onClick={()=>{ redirectToExternalLink(stat.region) }} tooltip={isExternalLinkAvailable(stat.region) ? null : "No external link for region yet"} textColor={isExternalLinkAvailable(stat.region) ? "link": "black"}>{renderDisplay(stat.region)}</Generic>
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
    )
}

export default USCountiesStatsTable