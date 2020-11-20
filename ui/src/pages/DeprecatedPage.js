import React from 'react'

import {
  Box, Content, Title
} from 'rbx'

import ContentLayout from '../layouts/ContentLayout'
import { usePageTitle } from '../hooks/ui'


import ContributorLarge from '../components/ContributorLarge.js'
import ContributorSmall from '../components/ContributorSmall.js'


export const DeprecatedPage = () => {

  usePageTitle('VirusTrack.live has been Deprecated')

  return (
    <ContentLayout>
        <Content>
          <Title style={{color: 'white'}}size={2}>This Project has been Deprecated</Title>
          <p style={{color: 'white', marginBottom: '2rem'}}>A special thanks to the VirusTrack contributors</p>

          <ContributorLarge 
            title="CIME" 
            src="https://user-images.githubusercontent.com/148262/99761673-825f7400-2aab-11eb-9728-b139635ad589.GIF"
            description="CIME Software Ltd is a consultancy that offers strategic technology planning in the areas of machine learning, exploratory analysis of unstructured data, and high performance system design to private and government entities in Europe, Asia, and Northamerica. 6 successful exits in the last 10 years are the result of 15+ years of applied experience in these technological areas. VirusTrack was a successful application of CIME's expertise in assembling a world-class team and delivering a production-ready, robust working system that would've taken other firms months to develop and deploy. Reach out to our principals via LinkedIn." 
            links={[
              {label: 'Website', url: 'https://cime.net'},
              {label: 'LinkedIn', url: 'https://www.linkedin.com/in/ciurana/'},
            ]}
            />
            <ContributorLarge 
            title="Mystic Coders" 
            src="https://avatars1.githubusercontent.com/u/63825021?s=200&v=4"
            description="We believe that launching awesome software projects shouldn't require you to spend late nights in your home office. Don't have to be overhelmed or frustrated by the technical minutae of that software project that just landed on your desk. We'll help your team launch amazing software products so you can spend less time at your desk and more time relaxing with your family." 
            links={[
              {label: 'Website', url: 'https://mysticcoders.com'},
            ]}
            />
            <ContributorLarge 
            title="Farad.ai" 
            description="Our mission is to enable the current electrical grid to run on 100% low carbon energy. To achieve this, we are developing an AI-powered decision support system, which aids energy stakeholders in the move towards a low carbon future." 
            links={[
              {label: 'Website', url: 'https://farad.ai'},
            ]}
            />
          <Box>
            <Title size={3}>Other Contributors</Title>
            <ContributorSmall
              name="Lucas Marohn" 
              links={[
                {label: 'Website', url: 'https://emergence.design'},
                {label: 'Linkedin', url: 'https://www.linkedin.com/in/lucasmarohn/'}
              ]}
              />
          </Box>
        </Content>
    </ContentLayout>
  )
}

export default DeprecatedPage
