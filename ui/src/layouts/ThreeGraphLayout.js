import React from 'react'

import { Column } from 'rbx'

export const ThreeGraphLayout = ({ children }) => {
    const nodes = React.Children.toArray(children);

    return (
        <>
            <Column.Group gapless>
                <Column>
                    {nodes[0]}
                </Column>
                <Column>
                    {nodes[1]}
                </Column>
                <Column>
                    {nodes[2]}
                </Column>

            </Column.Group>

            {children.slice(3)}
        </>
    )
}

export default ThreeGraphLayout