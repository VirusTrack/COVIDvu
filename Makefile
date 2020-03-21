# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


DOCKER_IMAGE=pr3d4t0r/$(shell cat dockerimagename.txt)
DOCKER_VERSION=$(shell cat dockerimageversion.txt)

include ./build.mk

