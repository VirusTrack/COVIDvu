from covidvu.pipeline.vujson import parseCSSE
from covidvu.predict import predictLogisticGrowth
from covidvu.predict import buildLogisticModel

confirmedCases=parseCSSE('confirmed')['casesUSStates']

regionsAll = confirmedCases.columns[confirmedCases.columns.map(lambda c: c[0]!='!')]

logRegModel = buildLogisticModel()

prediction = predictLogisticGrowth(logRegModel, regionName= 'Alabama', subGroup = 'casesUSStates')
