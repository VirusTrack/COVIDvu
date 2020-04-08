import React from 'react'
import { render, fireEvent } from '@testing-library/react'

import '@testing-library/jest-dom/extend-expect'

import ExternalLink from './ExternalLink'
import ReactGA from 'react-ga'

it('External Link has the text United States', () => {
    const { getByText } = render(<ExternalLink>United States</ExternalLink>)
    
    expect(getByText("United States")).toBeInTheDocument()
})

it('External Link click issues window.open and ReactGA.event', () => {
    const { getByText } = render(<ExternalLink externalKey="United Kingdom">United Kingdom</ExternalLink>)

    window.open = jest.fn()
    ReactGA.event = jest.fn()

    fireEvent.click(getByText(/United Kingdom/))

    expect(window.open).toBeCalled()
    expect(ReactGA.event).toBeCalled()
})
