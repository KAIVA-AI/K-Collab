export const Constants = {
  PROJECT_SETTING_HOST:
    process.env.PROJECT_SETTING_HOST || 'http://localhost:8000',
  // TODO hardcode
  REALM_STRING: process.env.REALM_STRING || 'pjd-2',
  USER_EMAIL: process.env.USER_EMAIL || '',
  USER_API_KEY: process.env.USER_API_KEY || '',
  CHANNEL_AI_CODING: 'AI Coding',
  BOT_CODING: 'VietIS-Coding',

  WEB_URL: process.env.PUBLIC_URL || 'http://localhost:3000',
  WEB_VERSION: process.env.WEBVIEW_VERSION || '1.0.0',
  ZULIP_PROTOCOL: process.env.ZULIP_PROTOCOL || 'http://',
  ZULIP_BASE_DOMAIN: process.env.ZULIP_BASE_DOMAIN || 'zulipdev.com:9991',
  ZULIP_SECONDARY_DOMAIN:
    process.env.ZULIP_SECONDARY_DOMAIN || 'ide-ext.collab.vietis.com.vn:9981',
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || 'Ov23liJvUHSfWdWvlqdl',
  GITHUB_REDIRECT_URL:
    process.env.GITHUB_REDIRECT_URL ||
    'http://localhost:8080/auth/github/callback',
  GITHUB_SCOPE: process.env.GITHUB_SCOPE || 'read:user user:email',
};

export const EMOJI_REGEX = /([\uD800-\uDBFF][\uDC00-\uDFFF])/g;
