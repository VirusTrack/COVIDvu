import React from 'react'

import Graph from './Graph'

export const GraphWithLoader = ({
        graphName, 
        title, 
        secondaryGraph, 
        x_title, 
        y_type, 
        y_title, 
        graph, 
        selected, 
        config, 
        showLog,
        ref
    }) => {
    
    return (
        <>
        { secondaryGraph === graphName &&
        <React.Fragment>
            { graph ? (
            <Graph title={title}
                data={graph}
                selected={selected} 
                config={config}
                y_type={y_type}
                x_title={x_title}
                y_title={y_title}
                showLog={showLog}
                ref={ref}
            />

            ) : (
                <div>
                    Loading...
                </div>
            )}
        </React.Fragment>  
        }
        </>
    )
}

export default GraphWithLoader