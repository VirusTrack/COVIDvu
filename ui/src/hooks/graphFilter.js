import { useState, useEffect } from 'react'

import { useHandleHistory } from './nav'
import store from 'store2'

import ReactGA from 'react-ga'

function useGraphFilter(
        region, 
        graphScaleParam, 
        graph, 
        showPredictionsParam, 
        graphScaleKey,
        query,
        defaultRegion,
        regionName,
        historyPrefix
        ) {

    const handleHistory = useHandleHistory(historyPrefix)
  
    const [selectedRegions, setSelectedRegions] = useState(region)
    const [graphScale, setGraphScale] = useState(graphScaleParam)
    const [showPredictions, setShowPredictions] = useState(showPredictionsParam)
    const [secondaryGraph, setSecondaryGraph] = useState(graph)
  

    useEffect(() => {
        if (!query) {
            handleHistory(selectedRegions, secondaryGraph, graphScale, showPredictions)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    const handleSelectedRegion = (regionList) => {
        setSelectedRegions(regionList)
  
        let actionDescription = `Changed selected regions to ${regionList.join(', ')}`
  
        ReactGA.event({
            category: `Region:${regionName}`,
            action: actionDescription,
        })
    
        handleHistory(regionList, secondaryGraph, graphScale, showPredictions)
    }
  
    const handleShowPredictions = () => {
      let historicSelectedRegions = selectedRegions
  
      if (selectedRegions.length > 1) {
        historicSelectedRegions = [defaultRegion]
        setSelectedRegions(historicSelectedRegions)
      }
      setShowPredictions(!showPredictions)
  
      handleHistory(historicSelectedRegions, secondaryGraph, graphScale, !showPredictions)
    }
  
    const handleGraphScale = (graphScale) => {
      setGraphScale(graphScale)
      graphScaleKey && (store.set(graphScaleKey, graphScale))
  
      handleHistory(selectedRegions, secondaryGraph, graphScale, showPredictions)
  
      ReactGA.event({
        category: `Region:${regionName}`,
        action: `Changed graph scale to ${graphScale}`,
      })
  
    }
  
    const handleSelectedGraph = (selectedGraph) => {
      setSecondaryGraph(selectedGraph)
      handleHistory(selectedRegions, selectedGraph, graphScale, showPredictions)
  
      ReactGA.event({
        category: `Region:${regionName}`,
        action: `Changed selected graph to ${selectedGraph}`,
      })
    }
  
  
  
    return {     
      selectedRegions, 
      graphScale,
      showPredictions,
      secondaryGraph,
      handleSelectedRegion, 
      handleSelectedGraph, 
      handleShowPredictions, 
      handleGraphScale 
    }
  }

  export default useGraphFilter