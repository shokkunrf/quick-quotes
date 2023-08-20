#!/bin/sh
set -e

sudo apt update && \
sudo apt install -y \
    git

if [ -f /workspace/transcriber/.devcontainer/userscript.sh ]; then
    . /workspace/transcriber/.devcontainer/userscript.sh
fi
echo 'Please reload window.'
