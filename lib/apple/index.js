var https = require('https');

var hosts = {
	sandbox: 'sandbox.itunes.apple.com',
	production: 'buy.itunes.apple.com'
};

var responses = {
	'21000': 'The App Store could not read the JSON object you provided.',
	'21002': 'The data in the receipt-data property was malformed or missing.',
	'21003': 'The receipt could not be authenticated.',
	'21004': 'The shared secret you provided does not match the shared secret on file for your account.',
	'21005': 'The receipt server is not currently available.',
	'21006': 'This receipt is valid but the subscription has expired. When this status code is returned to your server, the receipt data is also decoded and returned as part of the response.',
	'21007': 'This receipt is from the test environment, but it was sent to the production service for verification. Send it to the test environment service instead.',
	'21008': 'This receipt is from the production receipt, but it was sent to the test environment service for verification. Send it to the production environment service instead.'
};


function parseResult(result) {
	result = JSON.parse(result);

	var status = parseInt(result.status, 10);

	if (status !== 0) {
		var msg = responses[status] || 'Unknown status code: ' + status;

		var error = new Error(msg);
		error.status = status;

		throw error;
	}

	return {
		receipt: result.receipt
	};
}


function verify(data, host, cb) {
	var options = {
		method: 'POST',
		hostname: host,
		port: 443,
		path: '/verifyReceipt',
		headers: {
			'content-type': 'text/plain',
			'content-length': Buffer.byteLength(data)
		}
	};

	var req = https.request(options, function (res) {
		res.setEncoding('utf8');

		var data = '';

		res.on('data', function (str) {
			data += str;
		});

		res.on('end', function () {
			if (res.statusCode !== 200) {
				return cb(new Error('Received status code: ' + res.statusCode));
			}

			var result;

			try {
				result = parseResult(data);
			} catch (error) {
				return cb(error);
			}

			cb(null, result);
		});
	});

	req.on('error', cb);

	req.end(data);
}


function isBase64like(str) {
	return !!str.match(/^[a-zA-Z0-9\/+]+\={0,2}$/);
}


exports.verifyReceipt = function (receipt, cb) {
	var data;

	try {
		if (!isBase64like(receipt)) {
			receipt = (new Buffer(receipt, 'utf8')).toString('base64');
		}

		data = JSON.stringify({
			'receipt-data': receipt
		});
	} catch (error) {
		return process.nextTick(function () {
			cb(error);
		});
	}

	return verify(data, hosts.production, function (error, result) {
		// 21007: this is a sandbox receipt, so take it there

		if (error && error.status === 21007) {
			return verify(data, hosts.sandbox, cb);
		}

		cb(error, result);
	});
};
