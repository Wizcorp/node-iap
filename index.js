'use strict';

var platforms = {
	amazon: require('./lib/amazon'),
	apple: require('./lib/apple'),
	google: require('./lib/google'),
	roku: require('./lib/roku')
};


function makeMethod(methodName) {
	exports[methodName] = function (platform, payment, cb) {
		if (!payment) {
			return process.nextTick(cb, new Error('No payment given'));
		}

		var engine = platforms[platform];

		if (!engine) {
			return process.nextTick(
				cb,
				new Error(`Platform ${platform} not recognized`)
			);
		}

		if (!engine[methodName]) {
			return process.nextTick(
				cb,
				new Error(`Platform ${platform} does not have a ${methodName} method`)
			);
		}

		engine[methodName](payment, function (error, result) {
			if (error) {
				return cb(error);
			}

			result = result.platform = platform;

			cb(null, result);
		});
	};
}

makeMethod('verifyPayment');

makeMethod('cancelSubscription');
