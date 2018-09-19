'use strict';

var assert = require('assert');
var jwt = require('./jwt');
var apiUrls = require('./urls');
var https = require('../https');

function parseResult(resultString, payment) {
	var result = JSON.parse(resultString);
	var purchaseTimeMillis = result.startTimeMillis || result.purchaseTimeMillis;
	var purchaseDate = purchaseTimeMillis ? parseInt(purchaseTimeMillis, 10) : null;
	var expirationDate = result.expiryTimeMillis ? parseInt(result.expiryTimeMillis, 10) : null;

	return {
		receipt: result,
		transactionId: payment.receipt,
		productId: payment.productId,
		purchaseDate: purchaseDate,
		expirationDate: expirationDate
	};
}

function validatePaymentAndParseKeyObject(payment) {
	var keyObject;

	assert.equal(typeof payment.packageName, 'string', 'Package name must be a string');
	assert.equal(typeof payment.productId, 'string', 'Product ID must be a string');
	assert.equal(typeof payment.receipt, 'string', 'Receipt must be a string');

	if (typeof payment.keyObject === 'string' || Buffer.isBuffer(payment.keyObject)) {
		keyObject = JSON.parse(payment.keyObject);
	} else {
		keyObject = payment.keyObject;
	}

	assert(keyObject, 'Google API key object must be provided');
	assert.equal(typeof keyObject, 'object', 'Google API key object must be an object');
	assert.equal(typeof keyObject.client_email, 'string', 'Google API client_email must be a string');
	assert.equal(typeof keyObject.private_key, 'string', 'Google API private_key must be a string');

	return keyObject;
}

exports.verifyPayment = function (payment, cb) {
	var keyObject;

	try {
		keyObject = validatePaymentAndParseKeyObject(payment);
	} catch (error) {
		return process.nextTick(function () {
			cb(error);
		});
	}

	jwt.getToken(keyObject.client_email, keyObject.private_key, apiUrls.publisherScope, function (error, token) {
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

		https.get(requestUrl, null, function (error, res, resultString) {
			if (error) {
				return cb(error);
			}

			if (res.statusCode !== 200) {
				return cb(new Error('Received ' + res.statusCode + ' status code with body: ' + resultString));
			}

			var resultObject;
			try {
				resultObject = parseResult(resultString, payment);
			} catch (e) {
				return cb(e);
			}

			return cb(null, resultObject);
		});
	});
};


exports.cancelSubscription = function (payment, cb) {
	var keyObject;

	try {
		keyObject = validatePaymentAndParseKeyObject(payment);
	} catch (error) {
		return process.nextTick(function () {
			cb(error);
		});
	}

	jwt.getToken(keyObject.client_email, keyObject.private_key, apiUrls.publisherScope, function (error, token) {
		if (error) {
			return cb(error);
		}

		var requestUrl = apiUrls.purchasesSubscriptionsCancel(
			payment.packageName,
			payment.productId,
			payment.receipt,
			token
		);

		https.post(requestUrl, null, function (error, res, resultString) {
			if (error) {
				return cb(error);
			}

			if (res.statusCode !== 204) {
				return cb(new Error('Received ' + res.statusCode + ' status code with body: ' + resultString));
			}

			return cb(null, null);
		});
	});
};
