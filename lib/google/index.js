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

		https.get(requestUrl, null, function (error, res, responseString) {
			if (error) {
				return cb(error);
			}

			if (res.statusCode !== 200) {
				return cb(new Error('Received ' + res.statusCode + ' status code with body: ' + responseData));
			}

			var responseObject;
			try {
				responseObject = JSON.parse(responseString);
				assert.equal(responseObject.purchaseState, 0, 'purchaseCancelled');
				assert.equal(responseObject.consumptionState, 1, 'notConsumed');
			} catch (e) {
				return cb(e);
			}

			return cb(null, {
				receipt: responseObject,
				transactionId: payment.receipt,
				productId: payment.productId,
			});
		});
	});
};