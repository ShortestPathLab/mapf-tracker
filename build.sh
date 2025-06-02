#!/bin/bash

docker build . -t mapf-tracker-api:latest
docker tag mapf-tracker-api:latest ghcr.io/shortestpathlab/mapf-tracker-api:latest

sh ./push.sh