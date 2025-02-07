#!/bin/bash
set -e
set -x
cd /home/zulip/ide-ext
git pull
yarn
## remmove all old file package
rm -f /home/zulip/ide-ext/*.vsix
rm -f /home/zulip/ide-ext/dist/webview/vscode/*.vsix
yarn package
yarn build-webview
mkdir -p dist/webview/vscode