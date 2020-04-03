#!/bin/bash
# Renaming a repo at Github from personal to project causes licensing
# and comment path changes needed throughout.
#

set -e

for f in $(grep -lrE "pr3d4t0r/COVIDvu" *;)
   do t='/tmp/f.tmp'; 
   awk '{gsub("pr3d4t0r/COVIDvu","VirusTrack/COVIDvu"); print;}' $f > "$t" && cp "$t" "$f"
done
