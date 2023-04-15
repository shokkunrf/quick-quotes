#!/bin/sh
set -e

sudo apt update && \
sudo apt install -y \
    git

if [ -f /workspace/.devcontainer/userscript.sh ]; then
    . /workspace/.devcontainer/userscript.sh
fi
echo 'Please reload window.'
