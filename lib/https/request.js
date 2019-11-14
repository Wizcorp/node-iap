'use strict';

const url = require('url');
const https = require('https');

module.exports = function (requestUrl, options, data, cb) {
	options = options || {};

	const parsedUrl = url.parse(requestUrl);

	if (parsedUrl.hostname) {
		options.hostname = parsedUrl.hostname;
	}

	if (parsedUrl.port) {
		options.port = parsedUrl.port;
	}

	if (parsedUrl.path) {
		options.path = parsedUrl.path;
	}

	const req = https.request(options, function (res) {
		res.setEncoding('utf8');

		let responseData = '';

		res.on('data', function (str) {
			responseData += str;
		});

		res.on('end', function () {
			cb(null, res, responseData);
		});
	});

	req.on('error', cb);

	req.end(data);
};
