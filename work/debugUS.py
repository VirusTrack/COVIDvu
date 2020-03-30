from covidvu.pipeline.vujson import parseCSSE
from covidvu.predict import predictLogisticGrowth
from covidvu.predict import buildLogisticModel

print('Parsing CSSE')
confirmedCases=parseCSSE('confirmed')['casesUSStates']
regionsAll = confirmedCases.columns[confirmedCases.columns.map(lambda c: c[0]!='!')]

print('Building model')
logRegModel = buildLogisticModel()

print('Predicting')
prediction = predictLogisticGrowth(logRegModel, regionName= 'Alabama', subGroup = 'casesUSStates')


print('Success!')
