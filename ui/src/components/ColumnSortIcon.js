import React from 'react'

import { Icon } from 'rbx'

import imgAngleDown from '../images/fa-icon-angle-down.svg'
import imgAngleUp from '../images/fa-icon-angle-up.svg'

export const ColumnSortIcon = ({ direction = 'desc', ...props }) => (
  direction === 'desc' ? 
      <Icon size="small" {...props}><img src={imgAngleDown} alt="Angle Down Icon" /></Icon> : 
      <Icon size="small" {...props}><img src={imgAngleUp} alt="Angle Up Icon" /></Icon>
)

export default ColumnSortIcon
