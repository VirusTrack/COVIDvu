import React from 'react'

import Plot from 'react-plotly.js';

import { Title, Section, Content } from "rbx"

import { HeaderContainer } from '../containers/HeaderContainer'
import { FooterContainer } from '../containers/FooterContainer'

export const HomePage = () => {

    return (
        <div>
            <HeaderContainer />

            <Section>
                <Content>
                    <Title>Home</Title>

                    <Plot
                        data={[
                        {
                            x: [1, 2, 3],
                            y: [2, 6, 3],
                            type: 'scatter',
                            mode: 'lines+markers',
                            marker: {color: 'red'},
                        },
                        {type: 'bar', x: [1, 2, 3], y: [2, 5, 3]},
                        ]}
                        layout={ {width: 320, height: 240, title: 'Confirmed Cases United States'} }
                    />

                </Content>
            </Section>
            
            <FooterContainer />
        </div>
    )
}

export default HomePage