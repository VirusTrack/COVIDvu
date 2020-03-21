import React from 'react'

import { useHistory, useLocation } from 'react-router'
import { useDispatch } from 'react-redux'
import { actions } from '../ducks/services'

import { Hero, Container, Button, Title } from "rbx"

export const HeroElement = ({title, subtitle, buttons}) => {

    const dispatch = useDispatch()
    const history = useHistory()
    const location = useLocation()

    const changePage = (pageLocation) => {
        if(location.pathname !== pageLocation) {
            dispatch(actions.clearGraphs())
            history.push(pageLocation)
        }
    }
 
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
            </Container>
            </Hero.Body>
        </Hero>
    )
}

export default HeroElement