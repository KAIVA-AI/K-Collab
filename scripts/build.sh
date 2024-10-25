set -e
set -x
git pull
yarn
yarn package
yarn build-webview
mkdir -p dist/webview/vscode
cp *.vsix dist/webview/vscode/
