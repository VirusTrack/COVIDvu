import { useLayoutEffect, useState, useEffect, useRef } from 'react'

import { useLocation } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'

import { actions } from '../ducks/services'

import store from 'store2'

import { 
    CLIENT_COUNTRY_KEY,
    CLIENT_COUNTRY_CODE_KEY,
} from '../constants'

import queryString from 'query-string'

const countryNav = require('../constants/countryNav.json')
const isoCountries = require('../constants/iso-countries.json')

export function useWindowSize() {
    const [size, setSize] = useState([0, 0])
    useLayoutEffect(() => {
        function updateSize() {
            setSize([window.innerWidth, window.innerHeight])
        }
        window.addEventListener('resize', updateSize)
        updateSize();
        return () => window.removeEventListener('resize', updateSize)
    }, []);
    return size
}

export function useInterval(callback, delay) {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current()
    }
    if (delay !== null) {
      let id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [delay]);
}

const getMobileDetect = userAgent => {
  const isAndroid = () => Boolean(userAgent.match(/Android/i))
  const isIos = () => Boolean(userAgent.match(/iPhone|iPad|iPod/i))
  const isOpera = () => Boolean(userAgent.match(/Opera Mini/i))
  const isWindows = () => Boolean(userAgent.match(/IEMobile/i))
  const isSSR = () => Boolean(userAgent.match(/SSR/i))

  const isMobile = () => Boolean(isAndroid() || isIos() || isOpera() || isWindows())
  const isDesktop = () => Boolean(!isMobile() && !isSSR())

  return {
    isMobile,
    isDesktop,
    isAndroid,
    isIos,
    isSSR
  }
}

export const useMobileDetect = () => {
  useEffect(() => {}, [])
    const userAgent = typeof navigator === 'undefined' ? 'SSR' : navigator.userAgent;
    return getMobileDetect(userAgent);
}

export const useClientCountry = () => {
    const { search } = useLocation()

    const dispatch = useDispatch()
    const clientCountry = useSelector(state => state.services.clientCountry)

    console.log(clientCountry)
    
    // Fetch the clientCountry from API
    useEffect(() => {
        dispatch(actions.fetchClientCountry())
    }, [dispatch])

    // useEffect(() => {
    //     console.log("new country grabbed")
    // }, [clientCountry])

    return clientCountry

}