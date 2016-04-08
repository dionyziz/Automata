#!/bin/bash

cd /var/www/discrete.gr/automata/

git pull
docker build -t automata .
docker kill automata
docker rm automata
docker run -d --net=host --name automata automata
