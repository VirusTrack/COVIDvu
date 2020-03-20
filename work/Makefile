#!/bin/bash
# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


SHELL=/bin/bash


BUILD=./build
DEVPI_USER=pr3d4t0r
DEVPI_PASSWORD=nopasswordsetyet
DIST=./dist
MODULE=$(shell cat modulename.txt)
# Preparation for devpi?
# REQUIREMENTS=$(shell cat requirements.txt)
REQUIREMENTS=requirements.txt
VERSION=$(shell cat version.txt)


# Targets:

all: ALWAYS
	make test
	make module
	make publish


clean:
	rm -Rf $(BUILD)/*
	rm -Rf $(DIST)/*
	rm -Rfv $$(find covidvu | awk '/__pycache__$$/')
	rm -Rfv $$(find test | awk '/__pycache__$$/')
	pushd ./resources ; pip uninstall -y $(MODULE)==$(VERSION) || true ; popd
    

install:
	pushd resources/ && pip install -e .. && popd
	pip list | awk 'NR < 3 { print; } /covidvu/'


module:
	pip install -r $(REQUIREMENTS)
	python setup.py bdist_wheel


publish:
	@echo "publishing NOOP"


nuke: ALWAYS
	make clean
	rm -Rf $(shell find covidvu | awk '/__pycache__$$/')
	rm -Rf $(shell find test/ | awk '/__pycache__$$/')


# Delete the Python virtual environment - necessary when updating the
# host's actual Python, e.g. upgrade from 3.7.5 to 3.7.6.
resetpy: ALWAYS
	rm -Rfv ./.Python ./bin ./build ./dist ./include ./lib


test: ALWAYS
	pip install -e .
	pytest -v ./test
	pip uninstall -y $(MODULE)==$(VERSION) || true
	rm -Rfv $$(find covidvu | awk '/__pycache__$$/')
	rm -Rfv $$(find test | awk '/__pycache__$$/')


ALWAYS:

