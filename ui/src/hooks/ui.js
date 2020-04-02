import { useLayoutEffect, useState, useEffect, useRef } from 'react'

import { useLocation } from 'react-router'

import store from 'store2'

import { 
    CLIENT_COUNTRY_KEY,
} from '../constants'

import queryString from 'query-string'

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

    let query = queryString.parse(search.indexOf('?') === 0 ? search.substr(1) : search)

    if(query.clientCountry && isoCountries.hasOwnProperty(query.clientCountry)) {
        store.set(CLIENT_COUNTRY_KEY, query.clientCountry)
    }

    if(!store.get(CLIENT_COUNTRY_KEY)) {
        return "US"         // always default to the US
    } else {
        return store.get(CLIENT_COUNTRY_KEY)
    }
}