#!/usr/bin/env python3
# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


# covidvu.virustrack
# AWS Lambda Edge functions


import json


# --- constants ---

CF_VIEWER_COUNTRY = 'cloudfront-viewer-country'
ISO_CODE_REF      = 'codeISO'


def lambdaHandler(event, context):
    request     = event['Records'][0]['cf']['request']
    headers     = request['headers']
    countryInfo = headers.get(CF_VIEWER_COUNTRY)[0]
    
    return {
         'status': '200',
         'statusDescription': 'OK',
         'headers': {
             'cache-control': [
                 {
                     'key': 'Cache-Control',
                     'value': 'max-age=3600'
                 }
             ],
             'content-encoding': [
                 {
                     'key': 'Content-Encoding',
                     'value': 'UTF-8'
                 }
             ],
             "content-type": [
                 {
                     'key': 'Content-Type',
                     'value': 'application/json'
                 }
             ],
         },
         'body': json.dumps({ ISO_CODE_REF: countryInfo['value'], })
     }

