#!/usr/bin/env bash

# If psql is not available, then exit
if ! command -v psql > /dev/null ; then
  echo "This script requires psql to be installed and on your PATH. Exiting"
  exit 1
fi

# Load database connection info
set -o allexport
source ./env
set +o allexport

# Connect to the database, run the query, then disconnect
psql -t -A -f ./job.sql