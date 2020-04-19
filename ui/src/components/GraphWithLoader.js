import React from 'react'

import SlopeGraph from './graph/SlopeGraph'
import LinearGraph from './graph/LinearGraph'
import LogarithmicGraph from './graph/LogarithmicGraph'
import MovingAverageGraph from './graph/MovingAverageGraph'
import PercentGraph from './graph/PercentGraph'
import PredictionGraph from './graph/PredictionGraph'

import { Notification } from 'rbx'

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
  predictions,
  showPredictions,
  ref,
}) => {

  const GraphOrLoading = ({graph, children}) => (
    <>
    { graph ? (
      React.Children.toArray(children)
    ) : (
      <div>
        Loading...
      </div>
    )}
    </>
  )

  if(secondaryGraph !== graphName) {
      return null
  }

  if(graphName === 'Mortality') {
    return (
        <GraphOrLoading graph={graph}>
            <PercentGraph
                graphName="Mortality"
                data={graph}
                selected={selected}
                y_title={y_title}
            />
        </GraphOrLoading>
    )
  }

  if(graphScale === GRAPHSCALE_TYPES.SLOPE) {
      return (
          <>
            <Notification>
              { graphName === 'Cases' &&
                <>
                  Number of confirmed cases after the 100th case. The dashed line indicates a 33% daily increase.
                </>
              }
              { graphName === 'Deaths' &&
                <>
                  Number of recorded deaths after the 10th death. The dashed line indicates a 33% daily increase.
                </>
              }
          </Notification>

          <GraphOrLoading graph={graph}>
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
          </GraphOrLoading>
        </>
      )
  } else if(graphScale === GRAPHSCALE_TYPES.LINEAR) {

    if(showPredictions) {
      return (
        <GraphOrLoading graph={graph}>
            <PredictionGraph
                graphName="Cases"
                title={selected}
                selected={selected}
                graphScale={graphScale}
                predictions={predictions}
                confirmed={graph}
            />
        </GraphOrLoading>
      )
    } else {
      return (
        <GraphOrLoading graph={graph}>
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
        </GraphOrLoading>
      )
    }
  } else if(graphScale === GRAPHSCALE_TYPES.LOGARITHMIC) {
    if(showPredictions) {
      return (
        <GraphOrLoading graph={graph}>
            <PredictionGraph
                graphName="Cases"
                title={selected}
                selected={selected}
                graphScale={graphScale}
                predictions={predictions}
                confirmed={graph}
            />
        </GraphOrLoading>
      )
    } else {
      return (
        <GraphOrLoading graph={graph}>
            <LogarithmicGraph 
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
        </GraphOrLoading>
      )
    }
  } else if(graphScale === GRAPHSCALE_TYPES.AVERAGE) {
    return (
      <GraphOrLoading graph={graph}>
          <MovingAverageGraph 
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
      </GraphOrLoading>
    )
  }

  return null
}

export default GraphWithLoader
