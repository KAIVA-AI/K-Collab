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

current_dir=$(pwd)
env_file="$current_dir/.env"
echo "file env: $env_file"
source "$env_file"
# load accesstoken by user
echo "domain :$PROJECT_SETTING_HOST \ $USERNAME \ $PASSWORD" 
response=$(curl --location "$PROJECT_SETTING_HOST/api/login" \
--header 'Content-Type: application/json' \
--data "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")
echo "API Response: $response"
token=$(echo "$response" | jq -r '.token')
echo "TOKEN : $token"
file_name=$(find $current_dir -type f -name "*.vsix" -exec basename {} \;)
file_name=$(basename "$file_name")

echo "file NAME: $file_name"
echo "file_url: '$UPLOAD_ENPOINT/$file_name end'"
response_upload_file=$(curl --location "$PROJECT_SETTING_HOST/api/workspace/update-vcollab-ide-ext" \
--header "Content-Type: application/json" \
--header "Authorization: Bearer $token" \
--data "{
    \"file_url\": \"$UPLOAD_ENPOINT/$file_name\"
}")
echo "Upload Response: $response_upload_file"
cp *.vsix dist/webview/vscode/