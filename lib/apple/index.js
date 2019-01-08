'use strict';

var assert = require('assert');
var https = require('../https');

var apiUrls = {
	sandbox: 'https://sandbox.itunes.apple.com/verifyReceipt',
	production: 'https://buy.itunes.apple.com/verifyReceipt'
};

var responses = {
	21000: 'The App Store could not read the JSON object you provided.',
	21002: 'The data in the receipt-data property was malformed or missing.',
	21003: 'The receipt could not be authenticated.',
	21004: 'The shared secret you provided does not match the shared secret on file for your account.',
	21005: 'The receipt server is not currently available.',
	21006: 'This receipt is valid but the subscription has expired. When this status code is returned to your server, the receipt data is also decoded and returned as part of the response.',
	21007: 'This receipt is from the test environment, but it was sent to the production service for verification. Send it to the test environment service instead.',
	21008: 'This receipt is from the production receipt, but it was sent to the test environment service for verification. Send it to the production environment service instead.'
};

function getReceiptFieldValue(receipt, field) {
	if (receipt.hasOwnProperty(field)) {
		return receipt[field];
	}

	if (receipt.hasOwnProperty('in_app') && receipt.in_app[0]) {
		// Find the last item purchased
		var sorted = receipt.in_app.sort((a, b) => {
			return b.purchase_date_ms - a.purchase_date_ms;
		});
		return sorted[0].hasOwnProperty(field) ? sorted[0][field] : null;
	}

	return null;
}

function parseTime(time) {
	if (time) {
		return parseInt(time, 10);
	}
	return null;
}

// RESULT DOCS https://developer.apple.com/library/content/releasenotes/General/ValidateAppStoreReceipt/Chapters/ValidateRemotely.html
function parseResult(result) {
	result = JSON.parse(result);

	var status = parseInt(result.status, 10);

	var latestReceiptInfo = null;

	if (status !== 0 && status !== 21006) {
		var msg = responses[status] || 'Unknown status code: ' + status;

		var error = new Error(msg);
		error.status = status;

		throw error;
	}

	var productId = getReceiptFieldValue(result.receipt, 'product_id');
	var transactionId = getReceiptFieldValue(result.receipt, 'transaction_id');
	var purchaseDate = parseTime(getReceiptFieldValue(result.receipt, 'purchase_date_ms'));
	var expirationDate = parseTime(
		getReceiptFieldValue(result.receipt, 'expires_date_ms') ||
		getReceiptFieldValue(result.receipt, 'expires_date')
	);
	var latestExpiredReceiptInfo = getReceiptFieldValue(result, 'latest_expired_receipt_info');
	var pendingRenewalInfo = getReceiptFieldValue(result, 'pending_renewal_info');

	if (result.hasOwnProperty('latest_receipt_info')) {
		if (Array.isArray(result.latest_receipt_info) && result.latest_receipt_info.length > 0) {
			latestReceiptInfo = result.latest_receipt_info.sort(function (a, b) {
				return parseInt(a.transaction_id, 10) - parseInt(b.transaction_id, 10);
			});
			var lastReceipt = latestReceiptInfo[latestReceiptInfo.length - 1];
			productId = lastReceipt.product_id;
			transactionId = lastReceipt.transaction_id;
			purchaseDate = parseTime(lastReceipt.purchase_date_ms);
			expirationDate = parseTime(lastReceipt.expires_date_ms || lastReceipt.expires_date);
		} else if (result.latest_receipt_info && result.latest_receipt_info.transaction_id) {
			latestReceiptInfo = [result.latest_receipt_info];

			productId = result.latest_receipt_info.product_id;
			transactionId = result.latest_receipt_info.transaction_id;
			purchaseDate = parseTime(result.latest_receipt_info.purchase_date_ms);
			expirationDate = parseTime(
				result.latest_receipt_info.expires_date_ms || result.latest_receipt_info.expires_date
			);
		}
	}

	return {
		receipt: result.receipt,
		latestReceiptInfo: latestReceiptInfo,
		latestExpiredReceiptInfo: latestExpiredReceiptInfo,
		productId: productId,
		transactionId: transactionId,
		purchaseDate: purchaseDate,
		expirationDate: expirationDate,
		pendingRenewalInfo: pendingRenewalInfo
	};
}

function verify(environmentUrl, options, cb) {
	https.post(environmentUrl, options, function (error, res, resultString) {
		if (error) {
			return cb(error);
		}

		if (res.statusCode !== 200) {
			return cb(new Error('Received ' + res.statusCode + ' status code with body: ' + resultString));
		}

		var resultObject;

		try {
			resultObject = parseResult(resultString);
		} catch (error) {
			return cb(error);
		}

		cb(null, resultObject);
	});
}


function isBase64like(str) {
	return Boolean(str.match(/^[a-zA-Z0-9/+]+={0,2}$/));
}

exports.verifyPayment = function (payment, cb) {
	var jsonData = {};

	try {
		assert.equal(typeof payment.receipt, 'string', 'Receipt must be a string');

		if (isBase64like(payment.receipt)) {
			jsonData['receipt-data'] = payment.receipt;
		} else {
			jsonData['receipt-data'] = Buffer.from(payment.receipt, 'utf8').toString('base64');
		}
	} catch (error) {
		return process.nextTick(function () {
			cb(error);
		});
	}

	if (payment.secret !== undefined) {
		assert.equal(typeof payment.secret, 'string', 'payment.secret must be a string');
		jsonData.password = payment.secret;
	}

	if (payment.excludeOldTransactions !== undefined) {
		assert.equal(typeof payment.excludeOldTransactions, 'boolean', 'payment.excludeOldTransactions must be a boolean');
		jsonData['exclude-old-transactions'] = payment.excludeOldTransactions;
	}

	function checkReceipt(error, result, environment) {
		if (error) {
			return cb(error);
		}

		var receipt = result.receipt;

		var productId = getReceiptFieldValue(receipt, 'product_id');

		if (payment.hasOwnProperty('productId') && payment.productId !== productId) {
			return cb(new Error('Wrong product ID: ' + payment.productId + ' (expected: ' + productId + ')'));
		}

		var receiptBundleId = getReceiptFieldValue(receipt, 'bid');

		if (receiptBundleId === null) {
			receiptBundleId = getReceiptFieldValue(receipt, 'bundle_id');
		}

		if (payment.hasOwnProperty('packageName') && payment.packageName !== receiptBundleId) {
			return cb(new Error('Wrong bundle ID: ' + payment.packageName + ' (expected: ' + receiptBundleId + ')'));
		}

		result.environment = environment;

		return cb(null, result);
	}


	verify(apiUrls.production, { json: jsonData }, function (error, resultString) {
		// 21007: this is a sandbox receipt, so take it there
		if (error && error.status === 21007) {
			return verify(apiUrls.sandbox, { json: jsonData }, function (error, res) {
				checkReceipt(error, res, 'sandbox');
			});
		}

		return checkReceipt(error, resultString, 'production');
	});
};
