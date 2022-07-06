#!/usr/bin/env bash

# Load database connection info
set -o allexport
source ./env
set +o allexport

# Connect to the database, run the query, then disconnect
~/../../usr/local/Cellar/postgresql@13/13.7/bin/psql -t -A -f ./job.sql
