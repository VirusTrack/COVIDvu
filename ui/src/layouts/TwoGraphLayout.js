import React from 'react'

import { Column, Notification } from 'rbx'

export const TwoGraphLayout = ({ children }) => {
    const nodes = React.Children.toArray(children);

    return (
        <>

            <Column.Group gapless>
                <Column>
                    <Notification>
                        <p>Compare specific regions using the multi-select below. Ctrl or Cmd-click to select multiple regions.</p>
                    </Notification>
                </Column>
            </Column.Group>

            <Column.Group gapless>
                <Column size={3}>
                    {nodes[0]}
                </Column>
                <Column>
                    {nodes[1]}
                </Column>
                <Column size={2}>
                    {nodes[2]}                                    
                </Column>

            </Column.Group>

            {children.slice(3)}

        </>
    )
}

export default TwoGraphLayout