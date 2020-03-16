#!/bin/bash
# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


SHELL=/bin/bash


BUILD=./build
DEVPI_USER=pr3d4t0r
DEVPI_PASSWORD=nopasswordsetyet
DIST=./dist
MODULE=$(shell cat modulename.txt)
REQUIREMENTS=$(shell cat requirements.txt)
VERSION=$(shell cat version.txt)


# Targets:

all: ALWAYS
	make test
	make module
	make publish


# Going to a different directory is necessary for deinstalling a package in
# a native Python environment; this has no effect in a virtualenv.
clean:
	rm -Rf $(BUILD)/*
	rm -Rf $(DIST)/*
	rm -Rfv $$(find alian | awk '/__pycache__$$/')
	rm -Rfv $$(find test | awk '/__pycache__$$/')
	pushd ./resources ; pip uninstall -y $(MODULE)==$(VERSION) || true ; popd
    

install:
	pushd ./resources ; devpi install $(MODULE)==$(VERSION) ; popd
	pip list | awk 'NR < 3 { print; } /alian/'


module:
	devpi install $(REQUIREMENTS)
	python setup.py bdist_wheel


publish:
	devpi upload dist/*whl
	@echo /$(DEVPI_USER)/dev/$(MODULE) "package versions:"
	@devpi getjson /$(DEVPI_USER)/dev/$(MODULE) | jq -M '.result[].version'


#	pip uninstall -y $$(pip list --format=columns | awk 'NR > 2 && !/setuptools/ && !/wheel/ && $$1 != "pip" { print($$1); }')
nuke: ALWAYS
	make clean
	rm -Rf $(shell find alian | awk '/__pycache__$$/')
	rm -Rf $(shell find test/ | awk '/__pycache__$$/')
	rm -Rfv ./bin ./include ./lib .Python 


# Delete the Python virtual environment - necessary when updating the
# host's actual Python, e.g. upgrade from 3.7.5 to 3.7.6.
resetpy: ALWAYS
	rm -Rfv ./.Python ./bin ./build ./dist ./include ./lib


test: ALWAYS
	devpi install $(REQUIREMENTS)
	pip install -e .
	pytest -v ./test
	pushd ./resources ; pip uninstall -y $(MODULE)==$(VERSION) || true ; popd
	rm -Rfv $$(find alian | awk '/__pycache__$$/')
	rm -Rfv $$(find test | awk '/__pycache__$$/')


# devpi configuration:
devpi: ALWAYS
	./pipsetup
	devpi logoff
	devpi use http://$(DEVPI_HOST) --set-cfg
	devpi login "$(DEVPI_USER)" --password "$(DEVPI_PASSWORD)" > /dev/null
	devpi use alian/dev


ALWAYS:

