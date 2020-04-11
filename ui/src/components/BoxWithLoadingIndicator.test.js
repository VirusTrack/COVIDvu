import React from 'react'
import { render } from '@testing-library/react'

import '@testing-library/jest-dom/extend-expect'

import BoxWithLoadingIndicator from './BoxWithLoadingIndicator'

it('Box does not show if hasData', () => {
    const { getByText } = render(<BoxWithLoadingIndicator />)

    expect(getByText("Loading...")).toBeInTheDocument()
})

it('Box shows if hasData is true', () => {
    const { getByText } = render(<BoxWithLoadingIndicator hasData={true}><h1>Has Data</h1></BoxWithLoadingIndicator>)

    expect(getByText("Has Data")).toBeInTheDocument()
})