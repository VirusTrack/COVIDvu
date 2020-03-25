// import { useEffect } from 'react'
import { useSelector } from 'react-redux'

export function useGraphData(region) {
    const services = useSelector(state => state.services)

    const confirmed = useSelector(state => state.services[region].confirmed)
    const sortedConfirmed = useSelector(state => state.services[region].sortedConfirmed)
    const deaths = useSelector(state => state.services[region].deaths)
    const mortality = useSelector(state => state.services[region].mortality)

    return { confirmed, sortedConfirmed, deaths, mortality }
}
