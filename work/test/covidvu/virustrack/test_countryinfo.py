#!/usr/bin/env python3
# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE
# vim: set fileencoding=utf-8:


from covidvu.virustrack.countryinfo import ISO_CODE_REF
from covidvu.virustrack.countryinfo import generateCodesAndCountriesTable
from covidvu.virustrack.countryinfo import lambdaHandler

import json


COUNTRY_QUERY_TEST_COUNTRY = 'GB'
COUNTRY_QUERY_TEST_EVENT   = {
  'Records': [
    {
      'cf': {
        'config': {
          'distributionDomainName': 'd111111abcdef8.cloudfront.net',
          'distributionId': 'EDFDVBD6EXAMPLE',
          'eventType': 'origin-request',
          'requestId': '4TyzHTaYWb1GX1qTfsHhEqV6HUDd_BzoBZnwfnvQc_1oF26ClkoUSEQ=='
        },
        'request': {
          'clientIp': '203.0.113.178',
          'headers': {
            'x-forwarded-for': [
              {
                'key': 'X-Forwarded-For',
                'value': '203.0.113.178'
              }
            ],
            'user-agent': [
              {
                'key': 'User-Agent',
                'value': 'Amazon CloudFront'
              }
            ],
            'via': [
              {
                'key': 'Via',
                'value': '2.0 2afae0d44e2540f472c0635ab62c232b.cloudfront.net (CloudFront)'
              }
            ],
            'host': [
              {
                'key': 'Host',
                'value': 'virustrack.live'
              }
            ],
            'cache-control': [
              {
                'key': 'Cache-Control',
                'value': 'no-cache, cf-no-cache'
              }
            ],
            'cloudfront-viewer-country': [
              {
                'value': 'GB',
                'key': 'cloudfront-viewer-country'
              }
            ]
          },
          'method': 'GET',
          'origin': {
            'custom': {
              'customHeaders': {},
              'domainName': 'virustrack.live',
              'keepaliveTimeout': 5,
              'path': '',
              'port': 443,
              'protocol': 'https',
              'readTimeout': 30,
              'sslProtocols': [
                'TLSv1',
                'TLSv1.1',
                'TLSv1.2'
              ]
            }
          },
          'querystring': '',
          'uri': '/'
        }
      }
    }
  ]
}


# --- tests ---

def test_lambdaHandler():
    result = lambdaHandler(COUNTRY_QUERY_TEST_EVENT, None)

    assert '200' == result['status']
    assert 'body' in result

    body = result['body']

    assert isinstance(body, str)

    body = json.loads(body)

    assert body[ISO_CODE_REF] == COUNTRY_QUERY_TEST_COUNTRY


def test_generateCodesAndCountriesTable():
    result = generateCodesAndCountriesTable()

    assert isinstance(result, str)

    result = json.loads(result)
    assert 'RU' in result
    assert 'Russia' == result['RU']

