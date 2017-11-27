'use strict';

var https = require('./index');

module.exports = function (url, options, cb) {
	options = options || {};

	// Set method to GET and call it
	options.method = 'GET';
	https.request(url, options, null, cb);
};
