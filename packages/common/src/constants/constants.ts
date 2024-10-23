export const Constants = {
  // TODO hardcode
  REALM_STRING: process.env.REALM_STRING || 'pjd-2',
  USER_EMAIL: process.env.USER_EMAIL || '',
  USER_API_KEY: process.env.USER_API_KEY || '',
  CHANNEL_BACKEND: 'Coding-Backend',
  CHANNEL_FRONTEND: 'Coding-Frontend',
  CHANNEL_DB: 'Coding-DB',
  BOT_CODING: 'VietIS-Coding',

  WEB_URL: process.env.PUBLIC_URL || 'http://localhost:3000',
  WEB_VERSION: process.env.WEBVIEW_VERSION || '1.0.0',
};
