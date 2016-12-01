#!/bin/bash

git pull
docker build -t automata .
docker kill automata
docker rm automata
docker run -d --net=host --name automata automata
