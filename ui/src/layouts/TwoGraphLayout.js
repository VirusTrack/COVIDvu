import React from 'react'

import { Column } from 'rbx'

export const TwoGraphLayout = ({ children }) => {
    const nodes = React.Children.toArray(children);

    return (
        <>
            <Column.Group gapless>
                <Column size={2}>
                    {nodes[0]}
                </Column>
                <Column>
                    {nodes[1]}
                </Column>
                <Column size={2}>
                    {children.slice(2)}                
                </Column>

            </Column.Group>
        </>
    )
}

export default TwoGraphLayout