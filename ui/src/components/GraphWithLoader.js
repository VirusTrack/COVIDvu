import React from 'react'

import Graph from './Graph'
import SlopeGraph from './graph/SlopeGraph'
import LinearGraph from './graph/LinearGraph'
import { GRAPHSCALE_TYPES } from '../constants'

export const GraphWithLoader = ({
  graphName,
  secondaryGraph,
  x_title,
  y_title,
  graph,
  selected,
  config,
  graphScale,
  ref,
}) => {

  if(secondaryGraph !== graphName) {
      return null
  }

  if(graphScale === GRAPHSCALE_TYPES.SLOPE) {
      return (
          <>
              <SlopeGraph 
                  graphName={graphName}
                  data={graph}
                  selected={selected}
                  config={config}
                  x_title={x_title}
                  y_title={y_title}
                  graphScale={graphScale}
                  start={(graphName === 'Cases') ? 100 : null}
                  ref={ref}
              />
          </>
      )
  } else if(graphScale === GRAPHSCALE_TYPES.LINEAR) {
    return (
      <>
          <LinearGraph 
              graphName={graphName}
              data={graph}
              selected={selected}
              config={config}
              x_title={x_title}
              y_title={y_title}
              graphScale={graphScale}
              start={(graphName === 'Cases') ? 100 : null}
              ref={ref}
          />
      </>
    )

  }

  return (
      <>
        { graph ? (
          <Graph
              graphName={graphName}
              data={graph}
              selected={selected}
              config={config}
              x_title={x_title}
              y_title={y_title}
              graphScale={graphScale}
              start={(graphName === 'Cases') ? 100 : null}
              ref={ref}
          />

        ) : (
          <div>
            Loading...
          </div>
        )}
      </>
  )
}

export default GraphWithLoader
