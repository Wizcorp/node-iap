#!/usr/bin/env node

var platform = process.argv[2];
var receipt = process.argv[3];

if (!platform || !receipt) {
	throw new Error('Please provide a platform name, followed by a receipt string');
}

var iap = require('../index.js');

iap.verifyReceipt(platform, receipt, function (error, result) {
	if (error) {
		return console.log(error);
	}

	console.log('Verified:');
	console.log(JSON.stringify(result, null, '\t'));
});
