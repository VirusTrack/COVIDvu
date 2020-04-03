#!/usr/bin/env python3
# See: https://github.com/COVIDvu/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


from covidvu.pipeline.pyavka import detectHTMLTablesRegions


# +++ constants +++

TEST_SITE_DATA = './resources/test_pipeline'


# +++ tests +++

def test_detectHTMLTablesRegions():
    result = detectHTMLTablesRegions(TEST_SITE_DATA)

    assert result
    assert len(result) > 0
    assert 'WORLD' in result
    assert 'fileHTML' in result['WORLD']
    assert 'table-' in result['WORLD']['fileHTML']


def test__generateCSVTo():
    # TODO:  Implement - subject to change soon, OK as technical debt
    pass


def test_processHTML2CSV():
    # TODO:  Implement - subject to change soon, OK as technical debt
    pass

