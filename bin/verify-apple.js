#!/usr/bin/env node

'use strict';

var argv = require('minimist')(process.argv.slice(2), { string: ['productId', 'packageName', 'receipt', 'secret'] });

if (argv.help) {
	console.log('Usage: ./verfiy.js --productId=abc --packageName=my.app --receipt=\'receipt-data\' --secret=\'shared secret\'');
	process.exit(1);
}

var iap = require('../index.js');

var platform = 'apple';
var payment = argv;

iap.verifyPayment(platform, payment, function (error, result) {
	if (error) {
		return console.log(error);
	}

	console.log('Verified:');
	console.log(JSON.stringify(result, null, '\t'));
});
