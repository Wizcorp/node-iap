#!/usr/bin/env node

'use strict';

const argv = require('minimist')(process.argv.slice(2), { string: ['secret', 'userId', 'receipt'] });

if (argv.help) {
	console.log('Usage: ./verfiy.js --secret=\'shared-secret\' --userId=\'amazon-user\' --receipt=\'receipt-data\'');
	process.exit(1);
}

const iap = require('../index.js');

const platform = 'amazon';
const payment = argv;

iap.verifyPayment(platform, payment, function (error, result) {
	if (error) {
		return console.log(error);
	}

	console.log('Verified:');
	console.log(JSON.stringify(result, null, '\t'));
});
