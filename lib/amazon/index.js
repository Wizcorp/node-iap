'use strict';

const assert = require('assert');
const https = require('../https');

const apiUrl = {
	production: 'https://appstore-sdk.amazon.com/version/1.0/verifyReceiptId/developer/'
};

function parseResult(resultString) {
	const result = JSON.parse(resultString);

	const purchaseDate = result.purchaseDate ? parseInt(result.purchaseDate, 10) : null;
	let expirationDate = null;
	if (result.cancelDate) {
		expirationDate = parseInt(result.cancelDate, 10);
	} else if (result.renewalDate) {
		expirationDate = parseInt(result.renewalDate, 10);
	}

	return {
		receipt: result,
		transactionId: result.receiptId,
		productId: result.productId,
		purchaseDate,
		expirationDate
	};
}

exports.verifyPayment = function (payment, cb) {
	try {
		assert.equal(typeof payment.secret, 'string', 'Shared secret must be a string');
		assert.equal(typeof payment.userId, 'string', 'User ID must be a string');
		assert.equal(typeof payment.receipt, 'string', 'Receipt must be a string');
	} catch (error) {
		return process.nextTick(function () {
			cb(error);
		});
	}

	const requestUrl = `${apiUrl.production + payment.secret}/user/${payment.userId}/receiptId/${payment.receipt}`;

	https.get(requestUrl, null, function (error, res, resultString) {
		if (error) {
			return cb(error);
		}

		let resultObject = null;

		try {
			resultObject = parseResult(resultString);
		} catch (error) {
			return cb(error);
		}

		if (res.statusCode === 400) {
			return cb(new Error('receiptId is invalid, or no transaction was found for this receiptId'));
		}

		if (res.statusCode === 496) {
			return cb(new Error('Invalid sharedSecret'));
		}

		if (res.statusCode === 497) {
			return cb(new Error('Invalid User ID'));
		}

		if (res.statusCode === 500) {
			return cb(new Error('There was an Internal Servor Error'));
		}

		if (res.statusCode !== 200) {
			return cb(new Error('Unknown operation exception'));
		}

		cb(null, resultObject);
	});
};
