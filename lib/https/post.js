var https = require('./index');
var formUrlencoded = require('form-urlencoded');


module.exports = function (url, options, cb) {
	options = options || {};

	// Try and extract data and set it's type
	var data = null;
	try {
		if (options.form) {
			data = formUrlencoded.encode(options.form);
			delete options.form;
			options.headers = {
				'content-type': 'application/x-www-form-urlencoded',
				'content-length': Buffer.byteLength(data)
			};
		}
	} catch (error) {
		cb(error);
	}

	// Set method to POST and call it
	options.method = 'POST';
	https.request(url, options, data, cb);
};