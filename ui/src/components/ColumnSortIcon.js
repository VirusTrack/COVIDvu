import React from 'react'

import { Icon } from 'rbx'

import imgAngleDown from '../images/fa-icon-angle-down.svg'
import imgAngleUp from '../images/fa-icon-angle-up.svg'

export const ColumnSortIcon = ({direction = 'desc'}) => {

    if(direction === 'desc') {
        return (
            <Icon size="small" style={{marginLeft: '.5rem', opacity: '.83'}}><img src={imgAngleDown} /></Icon>
        )
    } else {
        return (
            <Icon size="small" style={{marginLeft: '.5rem', opacity: '.83'}}><img src={imgAngleUp} /></Icon>
        )
    }
}

export default ColumnSortIcon