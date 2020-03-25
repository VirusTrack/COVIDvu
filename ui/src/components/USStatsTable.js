import React from 'react'
import { Icon } from 'rbx'

import numeral from 'numeral'

import { Title, Generic, Table } from 'rbx'

import imgAngleDown from '../images/fa-icon-angle-down.svg'
import imgAngleUp from '../images/fa-icon-angle-up.svg'

export const USStatsTable = ({statsForGraph, redirectToExternalLink, isExternalLinkAvailable, renderDisplay}) => {

    const toggleSorting = () => {
        return false
    }

    return (

        <div className="table-container">
        <Table fullwidth hoverable>
            <Table.Head>
                <Table.Row>
                    <Table.Heading>
                        Region
                    </Table.Heading>
                    <Table.Heading onClick={toggleSorting}>
                        Total Cases
                        <Icon size="small" style={{marginLeft: '.5rem', opacity: '.83'}}><img src={imgAngleDown} /></Icon>
                    </Table.Heading>
                    <Table.Heading>
                        New Cases
                        <Icon size="small" style={{marginLeft: '.5rem', opacity: '.83'}}><img src={imgAngleUp} /></Icon>
                    </Table.Heading>
                    <Table.Heading tooltipPosition="bottom" tooltip="Total not-for-profit beds available in each state">
                        Total Hospital Beds
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
                    <Table.Heading>
                        <Title size={5}>{stat.hospitalBeds > 0 ? numeral(stat.hospitalBeds).format('0,0') : '-'}</Title>
                    </Table.Heading>
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

export default USStatsTable