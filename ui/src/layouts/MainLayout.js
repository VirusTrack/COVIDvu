import React from 'react';

import { Content } from 'rbx';

import { HeaderContainer } from '../containers/HeaderContainer';
import { FooterContainer } from '../containers/FooterContainer';

export const MainLayout = ({ children, className }) => {
  const nodes = React.Children.toArray(children);

  return (
    <>
      <HeaderContainer />
      <Content style={{ margin: '0.5rem' }} className={className}>
        {nodes[0]}
      </Content>
      <FooterContainer />
    </>
  );
};

export default MainLayout;
