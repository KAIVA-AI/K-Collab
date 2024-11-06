export const Constants = {
  PROJECT_SETTING_HOST:
    process.env.PROJECT_SETTING_HOST || 'http://localhost:8000',
  // TODO hardcode
  REALM_STRING: process.env.REALM_STRING || 'pjd-k-ore-1',
  USER_EMAIL: process.env.USER_EMAIL || '',
  USER_API_KEY: process.env.USER_API_KEY || '',
  CHANNEL_AI_CODING: 'AI Coding',
  BOT_CODING: 'VietIS-Coding',

  WEB_URL: process.env.PUBLIC_URL || 'http://localhost:3000',
  WEB_VERSION: process.env.WEBVIEW_VERSION || '1.0.0',
};
console.log('CONTESTA SDA', Constants);
export const EMOJI_REGEX = /([\uD800-\uDBFF][\uDC00-\uDFFF])/g;
