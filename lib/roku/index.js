'use strict';

const assert = require('assert');
const https = require('../https');

const apiUrl = {
	production: 'https://apipub.roku.com/listen/transaction-service.svc/validate-transaction'
};

function parseResult(resultString) {
	const result = JSON.parse(resultString);

	// parse non-standard date properties (i.e. /Date(1483242628000-0800)/)
	// in order to extract value by milliseconds
	result.originalPurchaseDate = new Date(parseInt(result.originalPurchaseDate.substr(6), 10)).getTime();
	result.purchaseDate = new Date(parseInt(result.purchaseDate.substr(6), 10)).getTime();
	result.expirationDate = result.expirationDate ?
		new Date(parseInt(result.expirationDate.substr(6), 10)).getTime() :
		null;

	return {
		receipt: result,
		transactionId: result.transactionId,
		productId: result.productId,
		purchaseDate: result.purchaseDate,
		expirationDate: result.expirationDate
	};
}

exports.verifyPayment = function (payment, cb) {
	try {
		assert.equal(typeof payment.devToken, 'string', 'Developer ID must be a string');
		assert.equal(typeof payment.receipt, 'string', 'Receipt must be a string');
		assert.equal(payment.receipt.match(/\w/g).length, 32, 'Receipt must contain 32 digits');
		assert.equal(payment.receipt.match(/-/g).length, 4, 'Receipt must contain 4 dashes');
	} catch (error) {
		return process.nextTick(function () {
			cb(error);
		});
	}

	const requestUrl = `${apiUrl.production}/${payment.devToken}/${payment.receipt}`;

	https.get(requestUrl, { headers: { Accept: 'application/json' } }, function (error, res, resultString) {
		if (error) {
			return cb(error);
		}

		if (res.statusCode !== 200) {
			return cb(new Error(`Received ${res.statusCode} status code with body: ${resultString}`));
		}

		let resultObject = null;

		try {
			resultObject = parseResult(resultString);
		} catch (error) {
			return cb(error);
		}

		if (resultObject.receipt.errorMessage) {
			return cb(new Error(resultObject.receipt.errorMessage));
		}

		cb(null, resultObject);
	});
};
