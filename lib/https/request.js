var url = require('url');
var https = require('https');


module.exports = function (requestUrl, options, data, cb) {
	options = options || {};

	var parsedUrl = url.parse(requestUrl);

	if (parsedUrl.hostname) {
		options.hostname = parsedUrl.hostname;
	}

	if (parsedUrl.port) {
		options.port = parsedUrl.port;
	}

	if (parsedUrl.path) {
		options.path = parsedUrl.path;
	}

	var req = https.request(options, function (res) {
		res.setEncoding('utf8');

		var responseData = '';

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