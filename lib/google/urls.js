'use strict';

const util = require('util');


// OAuth URLs
exports.tokenRequest = 'https://accounts.google.com/o/oauth2/token';


// Authentication scope URLs
exports.publisherScope = 'https://www.googleapis.com/auth/androidpublisher';


// Android Purchases URLs & generators
exports.purchasesProductsGet = function (packageName, productId, receipt, accessToken) {
	const urlFormat = 'https://www.googleapis.com/androidpublisher/v3/applications/%s/purchases/products/%s/tokens/%s?access_token=%s';

	return util.format(
		urlFormat,
		encodeURIComponent(packageName),  // application package name
		encodeURIComponent(productId),    // productId
		encodeURIComponent(receipt),      // purchase token
		encodeURIComponent(accessToken)   // API access token
	);
};


// Android Subscriptions URLs & generators
exports.purchasesSubscriptionsGet = function (packageName, productId, receipt, accessToken) {
	const urlFormat = 'https://www.googleapis.com/androidpublisher/v3/applications/%s/purchases/subscriptions/%s/tokens/%s?access_token=%s';

	return util.format(
		urlFormat,
		encodeURIComponent(packageName),  // application package name
		encodeURIComponent(productId),    // productId
		encodeURIComponent(receipt),      // purchase token
		encodeURIComponent(accessToken)   // API access token
	);
};

exports.purchasesSubscriptionsCancel = function (packageName, productId, receipt, accessToken) {
	const urlFormat = 'https://www.googleapis.com/androidpublisher/v3/applications/%s/purchases/subscriptions/%s/tokens/%s:cancel?access_token=%s';

	return util.format(
		urlFormat,
		encodeURIComponent(packageName),  // application package name
		encodeURIComponent(productId),    // productId
		encodeURIComponent(receipt),      // purchase token
		encodeURIComponent(accessToken)   // API access token
	);
};

exports.purchasesSubscriptionsDefer = function (packageName, productId, receipt, accessToken) {
	var urlFormat = 'https://www.googleapis.com/androidpublisher/v2/applications/%s/purchases/subscriptions/%s/tokens/%s:defer?access_token=%s';

	return util.format(
		urlFormat,
		encodeURIComponent(packageName),  // application package name
		encodeURIComponent(productId),    // productId
		encodeURIComponent(receipt),      // purchase token
		encodeURIComponent(accessToken)   // API access token
	);
};
