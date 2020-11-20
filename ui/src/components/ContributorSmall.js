import React from 'react'
import { Level } from 'rbx'

export const ContributorSmall = ({name, links}) => {
  return (
    <Level as="div" style={{margin: 0}}>

      <Level.Item align="left">
        <strong style={{margin: 0, padding: 0}}>{name}</strong>
      </Level.Item>
      
      <Level.Item align="right">
        {links && links.map((linkObject, index) => <a key={index} style={{display: 'inline-block', marginLeft: '20px'}} rel="noopener noreferrer" target="_blank" href={linkObject.url}>{linkObject.label}</a>)}
      </Level.Item>

    </Level>
  )
}

export default ContributorSmall