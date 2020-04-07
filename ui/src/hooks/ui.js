import {
  useLayoutEffect, useState, useEffect, useRef,
} from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { actions } from '../ducks/services'

import {
  DEFAULT_DOCUMENT_TITLE,
} from '../constants'

/**
 * Change the document page title
 *
 * @param {*} pageTitle
 */
export function usePageTitle(pageTitle) {
  useEffect(() => {
    document.title = `${pageTitle} | ${DEFAULT_DOCUMENT_TITLE}`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

export function useChangePageTitle() {
  return (pageTitle, includeDefault = false) => {
    let title = `${pageTitle}`
    if (includeDefault) {
      title += ` | ${DEFAULT_DOCUMENT_TITLE}`
    }
    document.title = title
  }
}

/**
 * Introspect the window size
 */
export function useWindowSize() {
  const [size, setSize] = useState([0, 0])
  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight])
    }
    window.addEventListener('resize', updateSize)
    updateSize()
    return () => window.removeEventListener('resize', updateSize)
  }, [])
  return size
}

/**
 * Use an interval with the useEffect hook to call something every N seconds
 *
 * @param {*} callback
 * @param {*} delay
 */
export function useInterval(callback, delay) {
  const savedCallback = useRef()

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    function tick() {
      savedCallback.current()
    }
    if (delay !== null) {
      const id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [delay])
}

const getMobileDetect = (userAgent) => {
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
    isSSR,
  }
}

/**
 * Use the getMobileDetect on userAgent to find out if user is mobile or desktop
 */
export const useMobileDetect = () => {
  useEffect(() => {}, [])
  const userAgent = typeof navigator === 'undefined' ? 'SSR' : navigator.userAgent
  return getMobileDetect(userAgent)
}

/**
 * Grab our client country from /country_info
 */
export const useClientCountry = () => {
  const dispatch = useDispatch()
  const clientCountry = useSelector((state) => state.services.clientCountry)

  useEffect(() => {
    dispatch(actions.fetchClientCountry())
  }, [dispatch])

  return clientCountry
}
