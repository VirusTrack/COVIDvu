#!/bin/bash

# See: https://github.com/VirusTrack/COVIDvu/blob/master/LICENSE 
# vim: set fileencoding=utf-8:
# Version 2.0

# crontab compliant :)


# +++ constants +++

CONFIG_rclone="rclone.conf"
UPDATE_ERROR="$SITE_DATA_DIR/ERROR.txt"


# +++ functions +++

function die {
    echo "[Error $2] - $1" | tee "$UPDATE_ERROR"
    exit "$2"
} # die


function assertDatabaseOK {
    [[ -n $(which vtdbchk) ]] || die "vtdbchk missing; run make install in virtual environment" 26
    
    vtdbchk $MASTER_DATABASE || die "$MASTER_DATABASE integrity test failed" 97
} # assertDatabaseOK

