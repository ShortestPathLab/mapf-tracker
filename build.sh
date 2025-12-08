#!/bin/bash

docker build . -f dockerfile.client -t ghcr.io/shortestpathlab/mapf-tracker-client:latest
docker build . -f dockerfile.server -t ghcr.io/shortestpathlab/mapf-tracker-api:latest

sh ./push.sh