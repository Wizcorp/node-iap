'use strict';

var jwt = require('jwt-simple');
var apiUrls = require('./urls');
var https = require('../https');


var oneHour = 60 * 60;
// We will cache access tokens for reuse here
var cache = {};

exports.getToken = function (iss, key, scope, cb) {
	// First, check if we already have a valid access token for this issuer in the cache
	if (cache.hasOwnProperty(iss)) {
		// Now we check if the token is still valid or already expired
		if (cache[iss].expiry > Date.now()) {
			// We have a valid access token for this issuer - we can simply return it
			return setImmediate(cb, null, cache[iss].token);
		}
	}

	// No token in cache - let's get one
	var jwtToken = jwt.encode({
		iss: iss,
		scope: scope,
		aud: apiUrls.tokenRequest,
		exp: Math.floor(Date.now() / 1000) + oneHour,
		iat: Math.floor(Date.now() / 1000)
	}, key, 'RS256');

	var formData = {
		/* eslint-disable camelcase */
		grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
		/* eslint-enable camelcase */
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

		// Save the access token and its expiry date to cache. Save the expiry in milliseconds as it
		// will simplify the comparison code. Note that the expiry is a time in the future when the
		// token expires, it is not the length of the token's validity.
		cache[iss] = {
			/* jshint camelcase:false */
			token: responseObject.access_token,
			// Allow for at least one minute reserve so that we avoid situations where the token expires
			// in the next second or at a similarly inconvenient time
			expiry: ((responseObject.expires_in - 60) * 1000) + Date.now()
			/* jshint camelcase:true */
		};

		return cb(null, cache[iss].token);
	});
};
