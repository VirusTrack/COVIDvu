# See: https://github.com/pr3d4t0r/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:


FROM            jupyter/datascience-notebook:latest
MAINTAINER      covidvu.support@cime.net


USER            root

RUN             apt-get update && \
                apt-get -y upgrade && \
                apt-get -y install \
                    awscli \
                    colordiff \
                    git \
                    jq \
                    rclone \
                    ssh \
                    tree \
                    vim

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
RUN             pre-commit install

COPY            resources/_bash_profile /home/jovyan/.bash_profile

