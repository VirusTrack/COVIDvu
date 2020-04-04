import React from 'react'

import { useChangePage } from '../hooks/nav'

import { Hero, Container, Button, Title } from "rbx"

export const HeroElement = ({title, subtitle, buttons, children}) => {
    const nodes = React.Children.toArray(children);

    const changePage = useChangePage()

    return (
        <Hero size="medium">
            <Hero.Body>
            <Container>
                {subtitle &&
                    <Title subtitle size={2}>{subtitle}</Title>
                }
                {title &&
                    <Title size={1}>{title}</Title>
                }
                {buttons &&
                <Button.Group>
                    {buttons.map((button, idx) => (                
                        <Button key={idx} size="large" color="primary" onClick={() => {changePage(button.location)}}>{button.title}</Button>
                    ))}
                </Button.Group>
                }

                {nodes}
            </Container>
            </Hero.Body>
        </Hero>
    )
}

export default HeroElement