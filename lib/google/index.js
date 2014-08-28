var assert = require('assert');
var jwt = require('./jwt');
var apiUrls = require('./urls');
var https = require('../https');



exports.verifyPayment = function (payment, cb) {
	var data;

	try {
		assert.equal(typeof payment.packageName, 'string', 'Package name must be a string');
		assert.equal(typeof payment.productId, 'string', 'Product ID must be a string');
		assert.equal(typeof payment.receipt, 'string', 'Receipt must be a string');
		assert.equal(typeof payment.iss, 'string', 'Google ISS must be a string');
		assert.equal(typeof payment.key, 'string', 'Private key must be a string');
	} catch (error) {
		return process.nextTick(function () {
			cb(error);
		});
	}

	jwt.getToken(payment.iss, payment.key, apiUrls.publisherScope, function (error, requestToken) {
		if (error) {
			return cb(error);
		}

		var requestUrl = apiUrls.purchasesProductsGet(
			payment.packageName,
			payment.productId,
			payment.receipt,
			requestToken.access_token
		);

		https.get(requestUrl, null, function (error, responseString) {
			if (error) {
				return cb(error);
			}

			console.log('\nResult:', responseString);
			return cb();
		});
	});
};