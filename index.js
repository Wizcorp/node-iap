var platforms = {
	apple: require('./lib/apple'),
	google: require('./lib/apple')
};


exports.verifyPayment = function (platform, payment, cb) {
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

	engine.verifyPayment(payment, function (error, result) {
		if (error) {
			return cb(error);
		}

		result.platform = platform;

		cb(null, result);
	});
};
