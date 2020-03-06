import React from 'react'

import Plot from 'react-plotly.js';

import { Title, Section, Content } from "rbx"

import { HeaderContainer } from '../containers/HeaderContainer'
import { FooterContainer } from '../containers/FooterContainer'

const data = require('../constants/data.json')

export const HomePage = () => {

    return (
        <div>
            <HeaderContainer />

            <Section>
                <Content>
                    <Title>Home</Title>

                    <Plot
                        data={data.plot}
                        layout={ {width: 320, height: 240, title: 'Confirmed Cases United States'} }
                    />

                </Content>
            </Section>
            
            <FooterContainer />
        </div>
    )
}

export default HomePage