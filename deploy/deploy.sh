set -e
set -x
cd /home/zulip/ide-ext
git pull
yarn
yarn package
yarn build-webview
mkdir -p dist/webview/vscode
cp *.vsix dist/webview/vscode/
