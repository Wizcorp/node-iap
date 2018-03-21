var assert = require('assert');
var jwt = require('./jwt');
var apiUrls = require('./urls');
var https = require('../https');

function parseResult(responseString, payment) {
	var result = JSON.parse(responseString);

	var purchaseDate = parseInt(result.startTimeMillis);
	var expirationDate = parseInt(result.expiryTimeMillis);

	return {
		receipt: result,
		transactionId: payment.receipt,
		productId: payment.productId,
		purchaseDate: purchaseDate,
		expirationDate: expirationDate,
	};
}

exports.verifyPayment = function (payment, cb) {
	var keyObject;

	try {
		assert.equal(typeof payment.packageName, 'string', 'Package name must be a string');
		assert.equal(typeof payment.productId, 'string', 'Product ID must be a string');
		assert.equal(typeof payment.receipt, 'string', 'Receipt must be a string');

		if (typeof payment.keyObject === 'string' || Buffer.isBuffer(payment.keyObject)) {
			keyObject = JSON.parse(payment.keyObject);
		} else {
			keyObject = payment.keyObject;
		}

		/* jshint camelcase:false */
		assert(keyObject, 'Google API key object must be provided');
		assert.equal(typeof keyObject, 'object', 'Google API key object must be an object');
		assert.equal(typeof keyObject.client_email, 'string', 'Google API client_email must be a string');
		assert.equal(typeof keyObject.private_key, 'string', 'Google API private_key must be a string');
		/* jshint camelcase:true */
	} catch (error) {
		return process.nextTick(function () {
			cb(error);
		});
	}

	/* jshint camelcase:false */
	jwt.getToken(keyObject.client_email, keyObject.private_key, apiUrls.publisherScope, function (error, token) {
	/* jshint camelcase:true */
		if (error) {
			return cb(error);
		}

		var requestUrl;

		if (payment.subscription) {
			requestUrl = apiUrls.purchasesSubscriptionsGet(
				payment.packageName,
				payment.productId,
				payment.receipt,
				token
			);
		} else {
			requestUrl = apiUrls.purchasesProductsGet(
				payment.packageName,
				payment.productId,
				payment.receipt,
				token
			);
		}

		https.get(requestUrl, null, function (error, res, responseString) {
			if (error) {
				return cb(error);
			}

			if (res.statusCode !== 200) {
				return cb(new Error('Received ' + res.statusCode + ' status code with body: ' + responseString));
			}

			var resultObject;
			try {
				resultObject = parseResult(responseString, payment);
			} catch (e) {
				return cb(e);
			}

			return cb(null, resultObject);
		});
	});
};
