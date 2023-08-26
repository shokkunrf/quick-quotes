#!/bin/sh
set -e

if [ ! -e /initialized ]; then
  pip install -r /app/requirements.txt
  touch /initialized
fi

exec "$@"
