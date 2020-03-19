#!/usr/bin/env python3
# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


from covidvu.pipeline.vuregions import RegionsAggregator


# +++ tests +++

regionsAggregator = None    # global object - used in all tests


def test_RegionsAggregator_object():
    global regionsAggregator

    regionsAggregator = RegionsAggregator()

    assert len(regionsAggregator.buckets) >= 2
    assert 'North America' in regionsAggregator.buckets
    assert regionsAggregator.globalInputDatasets

    assert 'confirmed' in regionsAggregator.globalInputDatasets
    assert 'US' in regionsAggregator.globalInputDatasets['confirmed'].index
    dataset = regionsAggregator.globalInputDatasets['confirmed']
    dataset = dataset[dataset.index == 'US']
    assert dataset['2020-03-15']['US'] > 0

    assert isinstance(regionsAggregator.globalDatasets, dict)


def test_RegionsAggregator_groupContinentalRegions():
    continentalRegions = regionsAggregator.groupContinentalRegions()

    assert 'North America' in continentalRegions
    
    continentalRegion = continentalRegions['North America']
    for x in continentalRegion.index:
        print(x)


test_RegionsAggregator_object()
test_RegionsAggregator_groupContinentalRegions()

