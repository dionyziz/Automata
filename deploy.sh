#!/bin/bash

HOSTNAME='88.80.188.96' # This is Lovelace

ssh "$user"@"$HOSTNAME" bash -c '/var/www/discrete.gr/automata/restart.sh'
