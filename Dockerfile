# See: https://github.com/VirusTrack/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:

# https://hub.docker.com/r/jupyter/datascience-notebook/
FROM            jupyter/datascience-notebook:latest
MAINTAINER      covidvu.support@cime.net


USER            root

RUN             apt-get update && \
                apt-get -y upgrade && \
                apt-get -y install \
                    awscli \
                    colordiff \
                    dnsutils \
                    git \
                    jq \
                    rclone \
                    ssh \
                    tree \
                    vim

# The goal is to move away from all Conda dependencies, however
# that cannot happen at this point because the Jupyter Data
# Science image (parent in FROM above) currently relies on this.
#
# Note: pip needs to be after any Conda changes whereas those changes
# have no relationship to the overall pip state.

RUN             conda install --quiet --yes \
                    mkl

# update conda itself
RUN             conda update -n base conda

COPY            resources/_bash_profile /root/.bash_profile

USER            jovyan

RUN             pip install -U \
                    devpi-client \
                    jupyter_contrib_nbextensions \
                    jupyter_nbextensions_configurator \
                    pre-commit \
                    pudb \
                    pyflakes \
                    pytest 

RUN             jupyter contrib nbextension install --user

COPY            resources/_bash_profile /home/jovyan/.bash_profile

