# COVIDvu

COVID-19 data visualization.


---
## Developers

This project is designed so that developers and scientists can work in a
zero install environment by pulling a Docker image and performing all research
and coding activities within a container.  Users may also chose to use their 
preferred IDE and other Python tools and work on the file system, without ever
runnint the dockersized version.  This instructions show how to install and run
this zero install container.


### Run from a Docker container, zero install

- Clone this repository

  `git clone https://github.com/pr3d4t0r/COVIDvu.git covidvu`

- Go to the `covidvu` directory

  `cd covidvu`

- Set the COVIDvu Jupyter working directory to the current directory by creating
  a runtime configuration via the `run.env` file:

  ```
  cp run.env.SAMPLE run.env
  ```

  Change it to reflect your development environment and preferences:

  ```
  export COVIDVU_JUPYTER_MOUNT_POINT="/Users/joeuser/development/covidvu"
  export COVIDVU_NIC_BIND="127.0.0.1" # all interfaces
  export COVIDVU_PORT_BIND="8808"	  # Jupyter default

  ```


---
## Project

Fork this project GitHub at (pr3d4t0r/COVIDvu)[https://github.com/pr3d4t0r/COVIDvu]

- (COVID-19 complete genome)[https://www.ncbi.nlm.nih.gov/nuccore/MN908947.3] (8 KB)
- (Johns Hopkins University COVID-19 data sets)[https://github.com/CSSEGISandData/COVID-19] - GitHub


---
## Contributors

|  GitHub  | Name              |
|----------|-------------------|
| jaryaman | Dr. Juvid Aryaman |
| pr3d4t0r | Eugene Ciurana    |
| kinabalu | Andrew Lombardi   |


---
&#169; 2020 pr3d4t0r.  All rights reserved.

