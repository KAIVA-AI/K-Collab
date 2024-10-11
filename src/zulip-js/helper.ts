//@ts-nocheck
import realFetch from 'node-fetch';
import FormData = require('form-data');

export const fetch = function(url, options) {
	if (/^\/\//.test(url)) {
		url = 'https:' + url;
	}
	return realFetch.call(this, url, options);
};
export { FormData };

if (!global.fetch) {
	global.fetch = fetch;
	global.Response = realFetch.Response;
	global.Headers = realFetch.Headers;
	global.Request = realFetch.Request;
}
