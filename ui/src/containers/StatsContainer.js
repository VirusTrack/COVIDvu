import React, { useEffect, useState } from 'react'

import { useHistory } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { actions } from '../ducks/services'

import { Table, Title, Tab } from 'rbx'

import numeral from 'numeral'

export const StatsContainer = ({filter='Global'}) => {

    const dispatch = useDispatch()
    const history = useHistory()

    const [selectedTab, setSelectedTab] = useState(filter)

    const statsTotals = useSelector(state => state.services.global.statsTotals)
    const usStatsTotals = useSelector(state => state.services.usStates.statsTotals)

    const [statsForGraph, setStatsForGraph] = useState([])

    const renderDisplay = (value) => {
        return value.startsWith('!') ? value.substring(1) : value            
    }

    /**
     * Fetch all the data
     */
    useEffect(() => {
        dispatch(actions.fetchGlobal())
        dispatch(actions.fetchUSStates())

    }, [dispatch])


    useEffect(() => {

        if(selectedTab === 'Global' && statsTotals) {
            setStatsForGraph(statsTotals)
            history.replace('/stats?filter=Global')
        } else if(selectedTab === 'US' && usStatsTotals) {
            setStatsForGraph(usStatsTotals)
            history.replace('/stats?filter=US')
        }
    }, [selectedTab, statsTotals, usStatsTotals, history])

    if(!statsTotals) {
        return (
            <h1>Loading...</h1>
        )
    }

    return (
        <>
        <Tab.Group size="large">
            <Tab active={selectedTab === 'Global'} onClick={() => { setSelectedTab('Global')}}>Global</Tab>
            <Tab active={selectedTab === 'US'} onClick={() => { setSelectedTab('US')}}>US</Tab>
        </Tab.Group>

        <Table fullwidth hoverable>
            <Table.Head>
                <Table.Row>
                    <Table.Heading>
                        Region
                    </Table.Heading>
                    <Table.Heading>
                        Confirmed
                    </Table.Heading>
                    <Table.Heading>
                        Deceased
                    </Table.Heading>
                    <Table.Heading>
                        Recovered
                    </Table.Heading>
                    <Table.Heading>
                        Mortality Rate
                    </Table.Heading>
                    <Table.Heading>
                        Recovery Rate
                    </Table.Heading>
                </Table.Row>
            </Table.Head>
            <Table.Body>
                { statsForGraph.map((stat, idx) => (
                <Table.Row key={idx}>
                    <Table.Cell>
                        {renderDisplay(stat.region)}
                    </Table.Cell>
                    <Table.Cell>
                        <Title size={5} style={{color: 'hsl(141, 53%, 53%)'}}>{stat.confirmed}</Title>
                    </Table.Cell>
                    <Table.Cell>
                        <Title size={5} style={{color: 'hsl(348, 100%, 61%)'}}>{stat.deaths}</Title>
                    </Table.Cell>
                    <Table.Cell>
                        <Title size={5} style={{color: 'hsl(204, 86%, 53%)'}}>{stat.recovered}</Title>
                    </Table.Cell>
                    <Table.Cell>
                        <Title size={6}>{numeral(stat.mortality).format('0%')}</Title>
                    </Table.Cell>
                    <Table.Cell>
                        <Title size={6}>{numeral(stat.recovery).format('0%')}</Title>
                    </Table.Cell>
                </Table.Row>
                ))}
            </Table.Body>
        </Table>
        </>
    )    
}

export default StatsContainer