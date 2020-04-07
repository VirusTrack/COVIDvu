import React from 'react'
import { render, fireEvent } from '@testing-library/react'

import '@testing-library/jest-dom/extend-expect'

import ColumnSortIcon from './ColumnSortIcon'

it('Column Sort Icon is up arrow if direction is not passed', () => {
    const { getByAltText } = render(<ColumnSortIcon />)
    
    expect(getByAltText("Angle Down Icon")).toBeInTheDocument()
})

it('Column Sort Icon is up arrow if direction is desc', () => {
    const { getByAltText } = render(<ColumnSortIcon direction='desc' />)

    expect(getByAltText("Angle Down Icon")).toBeInTheDocument()
})

it('Column Sort Icon is up arrow if direction is asc', () => {
    const { getByAltText } = render(<ColumnSortIcon direction='asc' />)

    expect(getByAltText("Angle Up Icon")).toBeInTheDocument()
})