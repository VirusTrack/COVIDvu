import React from 'react'

import { Table } from 'rbx'
import { ColumnSortIcon } from './ColumnSortIcon'

export const SortedTableHeading = ({onSort, heading, selectedSort, direction, ...props}) => (
  <Table.Heading onClick={onSort} style={{ cursor: 'pointer'}} {...props}>      
      {heading}
      {selectedSort && <ColumnSortIcon style={{ marginLeft: '.5rem', opacity: '.83'}} direction={direction} />}
  </Table.Heading>
)

export default SortedTableHeading