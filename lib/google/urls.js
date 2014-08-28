var util = require('util');


// OAuth URLs
exports.tokenRequest = 'https://accounts.google.com/o/oauth2/token';


// Authentication scope URLs
exports.publisherScope = 'https://www.googleapis.com/auth/androidpublisher';


// Android Purchases URLs & generators
exports.purchasesProductsGet = function (packageName, productId, receipt, accessToken) {
	var baseUrl = 'https://www.googleapis.com/androidpublisher/v2';
	var packageUri = 'applications/' + encodeURIComponent(packageName);
	var productUri = 'purchases/products/' + encodeURIComponent(productId);
	var receiptUri = 'tokens/' + encodeURIComponent(receipt);

	var purchaseUrl = [baseUrl, packageUri, productUri, receiptUri].join('/');
	var accessToken = 'access_token=' + encodeURIComponent(accessToken);

	return purchaseUrl + '?' + accessToken;
};