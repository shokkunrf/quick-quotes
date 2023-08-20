#!/bin/sh
set -e

if [ ! -e /initialized ]; then
  pip install -r requirements.txt
  touch /initialized
fi

exec "$@"
