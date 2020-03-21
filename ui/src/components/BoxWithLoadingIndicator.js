import React from 'react'

import { Box } from 'rbx'

export const BoxWithLoadingIndicator = ({hasData, children}) => {
    const nodes = React.Children.toArray(children);

    return (
        <Box>
            {!hasData &&       
            <h1>Loading...</h1>
            }
            {hasData &&
                <>
                {nodes}
                </>
            }
        </Box>
    )
}

export default BoxWithLoadingIndicator