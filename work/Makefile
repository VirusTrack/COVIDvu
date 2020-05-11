#!/bin/bash
# See: https://github.com/VirusTrack/COVIDvu/blob/master/LICENSE 
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
SITE_DATA=./site-data


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
	rm -Rfv $$(find . | awk '/.ipynb_checkpoints/')
	pushd ./resources ; pip uninstall -y $(MODULE)==$(VERSION) || true ; popd
    

install:
	pushd resources/ && pip install -e .. && popd
	pip list | awk 'NR < 3 { print; } /covidvu/'


module:
	pip install -r $(REQUIREMENTS)
	python setup.py bdist_wheel


nuke: ALWAYS
	make clean
	rm -Rf $(shell find covidvu | awk '/__pycache__$$/')
	rm -Rf $(shell find test/ | awk '/__pycache__$$/')


publish:
	@echo "publishing NOOP"


refresh: ALWAYS
	conda install mkl-service
	pip install -U -r requirements.txt


# Delete the Python virtual environment - necessary when updating the
# host's actual Python, e.g. upgrade from 3.7.5 to 3.7.6.
resetpy: ALWAYS
	rm -Rfv ./.Python ./bin ./build ./dist ./include ./lib


test: ALWAYS
	[[ -d $(SITE_DATA) ]] || mkdir -p $(SITE_DATA)
	pip install -r requirements.txt
	pip install -e .
	pytest -v ./test/covidvu/pipeline/test_jsonpack.py
	pytest -v ./test/covidvu/pipeline/test_pyavka.py
	pytest -v ./test/covidvu/pipeline/test_vucounty.py
	pytest -v ./test/covidvu/pipeline/test_vuhospitals.py
	pytest -v ./test/covidvu/pipeline/test_vujson.py
	pytest -v ./test/covidvu/pipeline/test_vuregions.py
	pytest -v ./test/covidvu/pipeline/test_vugrowth.py
	pytest -v ./test/covidvu/test_cryostation.py
	pytest -v ./test/covidvu/test_predict.py
	pytest -v ./test/covidvu/test_utils.py
	pytest -v ./test/covidvu/test_visualize.py
	pytest -v ./test/covidvu/virustrack/test_countryinfo.py
	pip uninstall -y $(MODULE)==$(VERSION) || true
	rm -Rfv $$(find covidvu | awk '/__pycache__$$/')
	rm -Rfv $$(find test | awk '/__pycache__$$/')


ALWAYS:

