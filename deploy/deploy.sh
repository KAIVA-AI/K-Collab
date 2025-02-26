#!/bin/bash
set -e
set -x
cd /home/k-ide-ext/k-ide-ext
git pull
yarn
## remmove all old file package
rm -f /home/k-ide-ext/k-ide-ext/*.vsix
rm -f /home/k-ide-ext/k-ide-ext/dist/webview/vscode/*.vsix
yarn package
yarn build-webview
mkdir -p dist/webview/vscode