import React from 'react'

import Graph from './Graph'

export const GraphWithLoader = ({
  graphName,
  secondaryGraph,
  x_title,
  y_type,
  y_title,
  graph,
  selected,
  config,
  showLog,
  ref,
}) => (
  <>
    { secondaryGraph === graphName
        && (
        <>
          { graph ? (
            <Graph
              data={graph}
              selected={selected}
              config={config}
              y_type={y_type}
              x_title={x_title}
              y_title={y_title}
              showLog={showLog}
              start={(graphName === 'Cases') ? 100 : null}
              ref={ref}
            />

          ) : (
            <div>
              Loading...
            </div>
          )}
        </>
        )}
  </>
)

export default GraphWithLoader
