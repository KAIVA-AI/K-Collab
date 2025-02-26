# K-Collab VSCode Extension

## System Requirements
- Node.js 18+
- Yarn 1.22+

## Installation
```sh
cp .env.example .env

yarn
```

## Run dev
Launch the `Run Extension` configuration in VSCode.

## Open from uri
```
vscode://vietis.k-collab/redirect?token=TOKEN&email=EMAIL&realm=pj40247&local_path=PATH
```

## build
```sh
# vscode
yarn package
# webview
yarn build-webview
```
