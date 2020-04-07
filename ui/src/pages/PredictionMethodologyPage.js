import React from 'react'

import { Box, Content, Title } from 'rbx'

import MathJax from 'react-mathjax'
import ContentLayout from '../layouts/ContentLayout'

import { usePageTitle } from '../hooks/ui'


export const PredictionMethodologyPage = () => {
  usePageTitle('Prediction Methdology')

  return (

    <ContentLayout>
      <MathJax.Provider>

        <Box>
          <Content>
            <Title size={2}>The Prediction Methodology</Title>
            <p>
              COVID-19 model for predicting the spread of coronavirus through populations.
            </p>

            <Title size={4}>Background</Title>
            <p>
              In
              <em>covidvu.predict</em>
              {' '}
              we apply the
              <a href="https://en.wikipedia.org/wiki/Logistic_function" rel="noopener noreferer">logistic equation</a>
              {' '}
              to model the
              spread of COVID-19 cases in a given population. Briefly, the logistic
              equation may be used to describe the dynamics of a species (coronavirus)
              which is under the influence of two competing effects: population expansion
              through pure birth, and competition for resources causing over-crowding.
              We represent these dynamics mathematically with the following differential equation:
            </p>

            <MathJax.Node formula={`
                            \\frac{\\mathrm{d}X}{\\mathrm{d}t} = r X \\left(1 - \\frac{X}{K} \\right)                        
                        `}
            />


            {/* $$\frac{\mathrm{d}X}{\mathrm{d}t} = r X \left(1 - \frac{X}{K} \right)$$ */}


            <p>where</p>

            <ul>
              <li>
                <MathJax.Node inline formula="t" />
                {' '}
                = time
              </li>
              <li>
                <MathJax.Node inline formula="X" />
                {' '}
                = population size, analogous to the total number of infected individuals
              </li>
              <li>
                <MathJax.Node inline formula="r" />
                {' '}
                = growth rate, which is the rate at which the virus spread if left unimpeded in an infinite-sized population
              </li>
              <li>
                <MathJax.Node inline formula="K" />
                {' '}
                = carrying capacity, which is the total number of infected individuals as
                {' '}
                <MathJax.Node inline formula={'t \\rightarrow \\infty'} />
                in a finite-sized population given constraints such as hand washing, social isolation, health-care effectiveness etc.
              </li>
            </ul>

            <Title size={4}>Data cleaning</Title>
            <p>
              We have found that the dynamics of the spread of COVID-19 tends to follow logistic growth
              once the total number of cases has become more than just a handful. We therefore neglect data
              where the total number of cases
              {' '}
              <MathJax.Node inline formula={'X \\leq 50'} />
              , and require at
              least 10 days of data for this condition to be true before attempting to train a model for a
              particular region.
            </p>

            <Title size={4}>Mathematical model</Title>
            <p>
              The general solution to the differential equation above is
            </p>

            <MathJax.Node formula={'X(t) = \\frac{K}{1+\\left(\\frac{K-X_0}{X_0}\\right)e^{-r t}}'} />

            <p>
              where
              {' '}
              <MathJax.Node inline formula="X_0" />
              {' '}
              is the initial infected population size. Assuming
              <MathJax.Node inline formula={'K \\gg X_0'} />
              , we re-cast this equation in the form
            </p>

            <MathJax.Node formula={'X(t) = \\frac{L}{1+e^{-k(t-t_0)}}'} />

            <p>
              where
              {' '}
              <MathJax.Node inline formula="K=L" />
              ,
              <MathJax.Node inline formula="r=k" />
              , and
              <MathJax.Node inline formula={'t_0=1/r \\ln(K)'} />
              .
            </p>

            <p>
              Let
              {' '}
              <MathJax.Node inline formula={'\\hat{X}(t)'} />
              {' '}
              be a time series corresponding to measurements of
              <MathJax.Node inline formula="X(t)" />
              . We take
              a log transformation of
              <MathJax.Node inline formula="X(t)" />
              {' '}
              for numerical stability,
              <MathJax.Node inline formula={'Y(t) = \\ln(X(t)+1)'} />
              .
              Allowing
              <MathJax.Node inline formula={'\\theta'} />
              {' '}
              to denote the parameter vector
              <MathJax.Node inline formula={'\\theta=(L, k, t_0)'} />
              , and
              <MathJax.Node inline formula={'Y_\\theta(t)'} />
              {' '}
              the corresponding parametrised curve, we assume that
              <MathJax.Node inline formula={'\\hat{Y}(t)'} />
              {' '}
              obeys the
              following likelihood
            </p>

            <MathJax.Node formula={`
                        P(\\hat{Y}(t)|\\theta) = \\prod_t \\mathcal{N}(Y_\\theta(t), \\sigma^2)
                    `}
            />

            <p>
              where
              {' '}
              <MathJax.Node inline formula={'\\mathcal{N}(\\mu, \\sigma^2)'} />
              {' '}
              is a normal distribution with mean
              <MathJax.Node inline formula={'\\mu'} />
              {' '}
              and variance
              <MathJax.Node inline formula={'\\sigma^2'} />
              . In
              other words, we assume that the mean number of cases follows the logistic equation, with Normally-distributed noise in
              log space.
              <MathJax.Node inline formula={'Y_\\theta(t)'} />
              {' '}
              denotes that
              <MathJax.Node inline formula="Y(t)" />
              {' '}
              is parametrized by
              <MathJax.Node inline formula={'\\theta'} />
              . Defining the error
              model in log space has the advantage of naturally allowing the size of measurement error to grow in proportion to the mean number of cases, as well as potentially allowing for
              greater numerical stability for Markov chain Monte Carlo-based inference.
            </p>

            <p>
              We perform Bayesian inference using a No-U-Turn Sampler (NUTS; Hoffman, 2014) as implemented in
              {' '}
              <a href="https://pystan.readthedocs.io/en/latest/" rel="noopener noreferer">PyStan</a>
              {' '}
              using
              the following broad, weakly-informative, model priors:
            </p>

            <MathJax.Node formula={`
                        P(\\log_{10}{K}) = \\mathrm{Unif}(0, 10)
                    `}
            />

            <MathJax.Node formula={`
                        P(t_0) = \\mathrm{HalfNormal}(0, 10^6)
                    `}
            />

            <MathJax.Node formula={`
                        P(k) = \\mathcal{N}(0.5, 0.25)
                    `}
            />

            <MathJax.Node formula={`
                        P(\\sigma) = \\mathrm{HalfNormal}(0, 100)
                    `}
            />

            <p>
              where
              {' '}
              <MathJax.Node inline formula={'\\mathrm{Unif}(a,b)'} />
              {' '}
              is a uniform distribution between
              <MathJax.Node inline formula="a" />
              and
              {' '}
              <MathJax.Node inline formula="b" />
              , and
              {' '}
              <MathJax.Node inline formula={'\\mathrm{HalfNormal}(\\mu, \\sigma^2)'} />
              {' '}
              is a normal distribution with mean
              {' '}
              <MathJax.Node inline formula={'\\mu'} />
              {' '}
              and variance
              {' '}
              <MathJax.Node inline formula={'\\sigma^2'} />
              , which
              has been truncated at zero, retaining only positive values.
            </p>

            <Title size={4}>Outputs from MCMC</Title>
            <p>
              We return approximate central Bayesian confidence intervals and the posterior mean for
              <MathJax.Node inline formula="X(t)" />
              {' '}
              in
              <em>covidvu.predict.predictLogisticGrowth</em>
              . One may interpret
              the e.g. 95% confidence interval with the following statement:
            </p>

            <p>
              &quot;Assuming that the above model is the true model describing the dynamics of the spread of COVID-19
              through a particular population, and given our model priors, we may say with approximately 95% confidence
              that the true value of
              <MathJax.Node inline formula="X(t)" />
              {' '}
              will lie within the confidence bounds&quot;.
            </p>

            <p>
              We use the word &quot;approximate&quot; because Hamiltonian Monte Carlo will only guarantee that the numerically-generated
              samples from the posterior are true samples in the limit of an infinitely long chain. One may make the approximations
              more accurate by increasing nSamples in
              <em>covidvu.predict.predictLogisticGrowth</em>
              , and to a lesser extent, nTune and nChains.
            </p>

            <p>
              We also return the posterior mean, which is a good point-estimate for the dynamics of COVID-19 given our uncertainty
              in model parameters, given the observed data.
              {' '}
            </p>

          </Content>
        </Box>
      </MathJax.Provider>
    </ContentLayout>

  )
}

export default PredictionMethodologyPage
