#!/bin/bash
# Wrapper script to run php commands through docker-compose
docker-compose exec -T app php "$@"
