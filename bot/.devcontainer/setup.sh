#!/bin/sh
set -e

sudo apt update && \
sudo apt install -y \
    git

if [ -f /workspace/bot/.devcontainer/userscript.sh ]; then
    . /workspace/bot/.devcontainer/userscript.sh
fi
echo 'Please reload window.'
