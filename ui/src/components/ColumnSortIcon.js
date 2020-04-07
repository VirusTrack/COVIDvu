import React from 'react'

import { Icon } from 'rbx'

import imgAngleDown from '../images/fa-icon-angle-down.svg'
import imgAngleUp from '../images/fa-icon-angle-up.svg'

export const ColumnSortIcon = ({ direction = 'desc' }) => {
  if (direction === 'desc') {
    return (
      <Icon size="small" style={{ marginLeft: '.5rem', opacity: '.83' }}><img src={imgAngleDown} alt="Angle Down Icon" /></Icon>
    )
  }
  return (
    <Icon size="small" style={{ marginLeft: '.5rem', opacity: '.83' }}><img src={imgAngleUp} alt="Angle Up Icon" /></Icon>
  )
}

export default ColumnSortIcon
