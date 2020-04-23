#!/usr/bin/env python3
# See: https://github.com/VirusTrack/COVIDvu/blob/master/LICENSE
# vim: set fileencoding=utf-8:


import sys

from setuptools import find_packages
from setuptools import setup


# *** functions ***

def readToList(fileName):
    return [line.strip() for line in open(fileName).readlines()]


# *** main ***

if '__main__' == __name__:
    requirements = readToList('requirements.txt')

    setup(
        author               = 'The COVIDvu contributors',
        author_email         = 'covidvu.support@virustrack.live',
        dependency_links     = [
                                    'https://github.com/pr3d4t0r/repo/tarball/master#egg=vtrustler',
                               ],
        description          = 'COVIDvu common tools',
        entry_points         = {
                                    'console_scripts': {
                                        'vtdbchk=covidvu.cryostation:dbcheckmain',
                                    }
                               },
        include_package_data = True,
        install_requires     = requirements,
        license              = open('../LICENSE.txt').read(),
        long_description     = open('../README.md').read(),
        name                 = open('modulename.txt').read().replace('\n', ''),
        namespace_packages   = [ ],
        packages             = find_packages(),
        url                  = 'http://virustrack.live/covid',
        version              = open('version.txt').read().strip(),
    )

sys.exit(0)

