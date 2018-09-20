'use strict';

var platforms = {
	amazon: require('./lib/amazon'),
	apple: require('./lib/apple'),
	google: require('./lib/google'),
	roku: require('./lib/roku')
};


function makeMethod(methodName) {
	exports[methodName] = function (platform, payment, cb) {
		function asyncError(message) {
			var error = new Error(message);
			// this will cause the stack trace to start at the place where asyncError
			// is called
			error.captureStackTrace(error, asyncError);
			process.nextTick(cb, error);
		}

		if (!payment) {
			return asyncError('No payment given');
		}

		var engine = platforms[platform];

		if (!engine) {
			return asyncError('Platform ' + platform + ' not recognized');
		}

		if (!engine[methodName]) {
			return asyncError(
				'Platform ' + platform + ' does not have a ' + methodName + ' method'
			);
		}

		engine[methodName](payment, cb);
	};
}

makeMethod('verifyPayment');

makeMethod('cancelSubscription');
