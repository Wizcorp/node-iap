'use strict';

const platforms = {
	amazon: require('./lib/amazon'),
	apple: require('./lib/apple'),
	google: require('./lib/google'),
	roku: require('./lib/roku')
};

const promisify = (fn) => {
	return (...args) => {
		return new Promise((resolve, reject) => {
			fn(...args, (err, res) => {
				return (err ? reject(err) : resolve(res));
			});
		});
	};
};

function verifyPayment(platform, payment, cb) {
	function syncError(error) {
		process.nextTick(function () {
			cb(error);
		});
	}

	if (!payment) {
		return syncError(new Error('No payment given'));
	}

	const engine = platforms[platform];

	if (!engine) {
		return syncError(new Error(`Platform ${platform} not recognized`));
	}

	engine.verifyPayment(payment, function (error, result) {
		if (error) {
			return cb(error);
		}

		result.platform = platform;

		cb(null, result);
	});
}

function cancelSubscription(platform, payment, cb) {
	function syncError(error) {
		process.nextTick(function () {
			cb(error);
		});
	}

	if (!payment) {
		return syncError(new Error('No payment given'));
	}

	const engine = platforms[platform];

	if (!engine) {
		return syncError(new Error(`Platform ${platform} not recognized`));
	}

	if (!engine.cancelSubscription) {
		return syncError(new Error(`Platform ${platform
		} does not have cancelSubscription method`));
	}

	engine.cancelSubscription(payment, function (error, result) {
		if (error) {
			return cb(error);
		}

		cb(null, result);
	});
}

exports.verifyPayment = (platform, payment, cb) => {
	return (cb ? verifyPayment(platform, payment, cb) : promisify(verifyPayment)(platform, payment));
};

exports.cancelSubscription = (platform, payment, cb) => {
	return (cb ? cancelSubscription(platform, payment, cb) : promisify(cancelSubscription)(platform, payment));
};


exports.deferSubscription = function (platform, payment, deferralInfo, cb) {
	function syncError(error) {
		process.nextTick(function () {
			cb(error);
		});
	}

	if (!payment) {
		return syncError(new Error('No payment given'));
	}

	var engine = platforms[platform];

	if (!engine) {
		return syncError(new Error('Platform ' + platform + ' not recognized'));
	}

	if (!engine.deferSubscription) {
		return syncError(new Error('Platform ' + platform +
			' does not have deferSubscription method'));
	}

	engine.deferSubscription(payment, deferralInfo, function (error, result) {
		if (error) {
			return cb(error);
		}

		cb(null, result);
	});
};
