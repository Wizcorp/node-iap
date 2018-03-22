#!/usr/bin/env node

'use strict';

var fs = require('fs');
var path = require('path');
var argv = require('minimist')(process.argv.slice(2), { string: ['productId', 'packageName', 'receipt', 'keyFile'], boolean: ['subscription'] });

if (argv.help) {
	console.log('Usage: ./verfiy.js --productId=abc --packageName=my.app --receipt=\'receipt-data\' --keyFile=\'Google Play JSON key file\' --subscription=true');
	process.exit(1);
}

var iap = require('../index.js');

var platform = 'google';
var payment = argv;

payment.keyObject = fs.readFileSync(path.resolve(payment.keyFile));
delete payment.keyFile;

iap.verifyPayment(platform, payment, function (error, result) {
	if (error) {
		return console.log(error);
	}

	console.log('Verified:');
	console.log(JSON.stringify(result, null, '\t'));
});
