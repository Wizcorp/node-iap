var platforms = {
	apple: require('./lib/apple')
};


exports.verifyReceipt = function (platform, receipt, cb) {
	function syncError(error) {
		process.nextTick(function () {
			cb(error);
		});
	}

	if (!receipt) {
		return syncError(new Error('No receipt given'));
	}

	var engine = platforms[platform];

	if (!engine) {
		return syncError(new Error('Platform ' + platform + ' not recognized'));
	}

	engine.verifyReceipt(receipt, function (error, result) {
		if (error) {
			return cb(error);
		}

		result.platform = platform;

		cb(null, result);
	});
};
