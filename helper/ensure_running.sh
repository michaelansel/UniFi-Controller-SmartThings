#!/bin/bash

# executed via crontab: 0 * * * * /home/pi/unifi-presence/ensure_running.sh

if ! { tmux list-sessions | egrep -q "^unifi-presence:" ; } ; then
  tmux new-session -d -s unifi-presence /bin/bash -c "cd /home/pi/unifi-presence && node index.js"
fi
