var assert = require('assert');
var https = require('../https');

var apiUrls = {
	production: 'https://apipub.roku.com/listen/transaction-service.svc/validate-transaction'
};

exports.verifyPayment = function (payment, cb) {
	try {
		assert.equal(typeof payment.devToken, 'string', 'Developer ID must be a string');
		assert.equal(typeof payment.receipt, 'string', 'Receipt must be a string');
		assert.equal(payment.receipt.match(/[\d|\w]/g).length, 32, 'Receipt must contain 32 digits');
		assert.equal(payment.receipt.match(/-/g).length, 4, 'Receipt must contain 4 dashes');
	} catch (error) {
		return process.nextTick(function () {
			cb(error);
		});
	}

	var requestUrl = apiUrls.production + '/' + payment.devToken + '/' + payment.receipt;

	https.get(requestUrl, {headers: {Accept: 'application/json'}}, function (error, res, resultString) {
		if (error) {
			return cb(error);
		}

		if (res.statusCode !== 200) {
				return cb(new Error('Received ' + res.statusCode + ' status code with body: ' + resultString));
		}

		var resultObject = null;

		try {
			resultObject = JSON.parse(resultString);
		} catch (error) {
			return cb(error);
		}

		if (resultObject.errorMessage !== '') {
			return cb(new Error(resultObject.errorMessage));
		}

		resultObject.expirationDate = new Date(parseInt(resultObject.expirationDate.substr(6))).getTime();
		resultObject.originalPurchaseDate = new Date(parseInt(resultObject.originalPurchaseDate.substr(6))).getTime();
		resultObject.purchaseDate = new Date(parseInt(resultObject.purchaseDate.substr(6))).getTime();

		cb(null, {
			receipt: resultObject,
			transactionId: resultObject.transactionId,
			productId: resultObject.productId
		});
	});
};
