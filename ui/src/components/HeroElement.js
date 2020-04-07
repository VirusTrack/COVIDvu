import React from 'react'

import { useChangePage } from '../hooks/nav'

import { Hero, Button, Title, Column } from "rbx"

export const HeroElement = ({title, subtitle, buttons, children, updated, columns}) => {
    const nodes = React.Children.toArray(children);
    const changePage = useChangePage()

    return (
        <>
        <Hero size="small">
            <Hero.Body>
                <Column.Group vcentered gapSize={5}>
                {nodes[0] ? <Column narrow>
                    {nodes[0]}
                </Column> : null}
                <Column narrow>
                {subtitle &&
                    <Title subtitle size={2}>{subtitle}</Title>
                }
                {title &&
                    <Title size={1}>{title}</Title>
                }

                {buttons &&
                <Button.Group size="large">
                    {buttons.map((button, idx) => (                
                        <Button key={idx} color="primary" onClick={() => {changePage(button.location)}}>{button.title}</Button>
                    ))}
                </Button.Group>
                }

                {updated}
                </Column>

                {nodes[1] ? 
                <Column>
                    {nodes[1]}
                </Column> : null}

                </Column.Group>
            </Hero.Body>
        </Hero>
        </>
    )
}

export default HeroElement