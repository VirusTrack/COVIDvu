import React from 'react'
import { Column, Box, Title } from 'rbx'

export const ContributorLarge = ({title, description, src, links}) => {
  return (
  <Box style={{padding: '20px 10px', marginBottom: '2rem'}}>
    <Column.Group>
      {src && <Column size="one-fifth">
        <img width="100" height="100" src={src} alt={`${title} logo`} />
      </Column>}

      <Column>
        <Title size={3}>{title}</Title>
        <p>{description}</p>
        {links && links.map((linkObject, index) => <a key={index} style={{display: 'inline-block', marginRight: '20px'}} target="_blank" rel="noopener noreferrer" href={linkObject.url}>{linkObject.label}</a>)}
      </Column>
    </Column.Group>
  </Box>
  )
}

export default ContributorLarge