import React from 'react';

import { Column, Level, Title } from 'rbx';
import LogoElement from '../components/LogoElement';

export const TwoGraphLayout = ({ children }) => {
  const nodes = React.Children.toArray(children);

  return (
    <>

      <Title as="div" style={{ fontSize: '1.4rem', fontWeight: 400 }}>
        <LogoElement size="small" />
        Select from the options below to compare regions
      </Title>

      <Column.Group breakpoint="tablet" style={{ margin: 0, padding: 0 }} gapless>
        <Column size={3} style={{ margin: 0, padding: 0 }} className="select-sidebar">
          {nodes[0]}
        </Column>
        <Column style={{ margin: '1.5rem' }}>
          <Level align="right">
            {nodes[2]}
          </Level>
          {nodes[1]}

          {children.slice(3)}
        </Column>
      </Column.Group>
    </>
  );
};

export default TwoGraphLayout;
