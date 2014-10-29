var jwt = require('jwt-simple');
var apiUrls = require('./urls');
var https = require('../https');


var oneHour = 60 * 60;


exports.getToken = function (iss, key, scope, cb) {
	var jwtToken = jwt.encode({
		iss: iss,
		scope: scope,
		aud: apiUrls.tokenRequest,
		exp: Math.floor(Date.now() / 1000) + oneHour,
		iat: Math.floor(Date.now() / 1000)
	}, key, 'RS256');

	var formData = {
		/* jshint camelcase:false */
		grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
		/* jshint camelcase:true */
		assertion: jwtToken
	};

	https.post(apiUrls.tokenRequest, { form: formData }, function (error, res, responseString) {
		if (error) {
			return cb(error);
		}

		if (res.statusCode !== 200) {
			return cb(new Error('Received ' + res.statusCode + ' status code with body: ' + responseString));
		}

		var responseObject;
		try {
			responseObject = JSON.parse(responseString);
		} catch (error) {
			return cb(error);
		}

		return cb(null, responseObject);
	});
};