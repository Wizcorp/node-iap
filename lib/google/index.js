'use strict';

const assert = require('assert');
const jwt = require('./jwt');
const apiUrls = require('./urls');
const https = require('../https');

function parseResult(resultString, payment) {
	const result = JSON.parse(resultString);
	const purchaseTimeMillis = result.startTimeMillis || result.purchaseTimeMillis;
	const purchaseDate = purchaseTimeMillis ? parseInt(purchaseTimeMillis, 10) : null;
	const expirationDate = result.expiryTimeMillis ? parseInt(result.expiryTimeMillis, 10) : null;

	return {
		receipt: result,
		transactionId: result.orderId,
		productId: payment.productId,
		purchaseDate,
		expirationDate
	};
}

function validatePaymentAndParseKeyObject(payment) {
	let keyObject;

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

function validateDeferralInfo(deferralInfo) {
	assert.equal(typeof deferralInfo, 'object', 'deferralInfo must be an object');
	assert.equal(typeof deferralInfo.expectedExpiryTimeMillis, 'number', 'expectedExpiryTimeMillis must be a number');
	assert.equal(typeof deferralInfo.desiredExpiryTimeMillis, 'number', 'desiredExpiryTimeMillis must be a number');

	assert(deferralInfo.desiredExpiryTimeMillis > deferralInfo.expectedExpiryTimeMillis, 'desiredExpiryTimeMillis must be greater than expectedExpiryTimeMillis');

	return deferralInfo;
}


exports.verifyPayment = function (payment, cb) {
	let keyObject;

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

		let requestUrl;

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
				return cb(new Error(`Received ${res.statusCode} status code with body: ${resultString}`));
			}

			let resultObject;
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
	let keyObject;

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

		const requestUrl = apiUrls.purchasesSubscriptionsCancel(
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
				return cb(new Error(`Received ${res.statusCode} status code with body: ${resultString}`));
			}

			return cb(null, null);
		});
	});
};


exports.deferSubscription = function (payment, deferralInfo, cb) {
	let keyObject;
	let options;

	try {
		keyObject = validatePaymentAndParseKeyObject(payment);
		options.json = {
			deferralInfo: validateDeferralInfo(deferralInfo)
		};
	} catch (error) {
		return process.nextTick(function () {
			cb(error);
		});
	}

	jwt.getToken(keyObject.client_email, keyObject.private_key, apiUrls.publisherScope, function (error, token) {
		if (error) {
			return cb(error);
		}

		const requestUrl = apiUrls.purchasesSubscriptionsDefer(
			payment.packageName,
			payment.productId,
			payment.receipt,
			token
		);

		https.post(requestUrl, options, function (error, res, resultString) {
			if (error) {
				return cb(error);
			}

			if (res.statusCode !== 200) {
				return cb(new Error(`Received ${res.statusCode} status code with body: ${resultString}`));
			}

			var resultObject;
			try {
				resultObject = JSON.parse(resultString);
			} catch (e) {
				return cb(e);
			}

			return cb(null, resultObject);
		});
	});
};
