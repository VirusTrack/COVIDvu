# See: https://github.com/VirusTrack/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


DOCKER_IMAGE=VirusTrack/$(shell cat dockerimagename.txt)
DOCKER_VERSION=$(shell cat dockerimageversion.txt)

include ./build.mk

