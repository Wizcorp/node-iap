# In-app purchase verification

Inspired by the [iap_verifier](https://github.com/pcrawfor/iap_verifier/) CoffeeScript module
written by Paul Crawford, I wanted a pure JavaScript implementation of in-app purchase verification.
I also wanted to add support for other app stores, and not just limit this to Apple. The `iap`
module is exactly that. Pull requests to add support for other platforms are very welcome!

## Installation

```sh
npm install iap
```

## Usage

Only a single method is exposed to verify purchase receipts:

```javascript
var iap = require('iap');

var platform = 'apple';
var payment = {
	receipt: 'receipt data', // always required
	productId: 'abc',
	packageName: 'my.app',
	secret: 'password',
	subscription: true,	// optional, if google play subscription
	devToken: 'developer id' // required, if roku
};

iap.verifyPayment(platform, payment, function (error, response) {
	/* your code */
});
```

The receipt you pass must conform to the requirements of the backend you are verifying with. Read
the next chapter for more information on the format.

## Supported platforms

### Apple

**The payment object**

The receipt string passed may be either the base64 string that Apple really wants, or the decoded
receipt as returned by the iOS SDK (in which case it will be automatically base64 serialized).

Both productId and packageName (bundle ID) are optional, but when provided will be tested against.
If the receipt does not match the provided values, an error will be returned.

To verify auto-renewable subscriptions you need to provide `secret` field that
contains your In-App Purchase Shared Secret

**The response**

The response passed back to your callback will also be Apple specific. The entire parsed receipt
will be in the result object:

```json
{
        "receipt": {
                "original_purchase_date_pst": "2014-02-24 23:19:49 America/Los_Angeles",
                "purchase_date_ms": "1393312789954",
                "unique_identifier": "78abf2209323434771637ee22f0ee8b8341f14b4",
                "original_transaction_id": "1000000102526370",
                "bvrs": "0.0.1",
                "transaction_id": "1000000102526671",
                "quantity": "1",
                "unique_vendor_identifier": "206FED24-2EAB-4FC6-B946-4AF61086DF21",
                "item_id": "820817285",
                "product_id": "abc",
                "purchase_date": "2014-02-25 07:19:49 Etc/GMT",
                "original_purchase_date": "2014-02-25 07:19:49 Etc/GMT",
                "purchase_date_pst": "2014-02-24 23:19:49 America/Los_Angeles",
                "bid": "test.myapp",
                "original_purchase_date_ms": "1393312789954"
        },
        "transactionId": "1000000102526671",
        "productId": "abc",
        "platform": "apple",
        "environment": "production"
}
```


### Google Play

**The payment object**

The receipt string is the purchase token that Google Play returns to the mobile application when a purchase is made.

Both packageName and productId are compulsory.

Lastly you must provide `keyObject` which is the Google API Service Account JSON key file linked to your Google Play
account for authentication. This property can be either a string, file buffer or an object. If provided a string or file
buffer, the call will automatically parse it into an object for use.

**The response**

The response passed back to your callback will also be Google Play specific. The entire parsed response will be in the
receipt sub-object.

```json
{
        "receipt": {
                "kind": "androidpublisher#productPurchase",
                "purchaseTimeMillis": "1410835105408",
                "purchaseState": 0,
                "consumptionState": 1,
                "developerPayload": ""
        },
        "transactionId": "ghbbkjheodjokkipdmlkjajn.AO-J1OwfrtpJd2fkzzZqv7i107yPmaUD9Vauf9g5evoqbIVzdOGYyJTSEMhSTGFkCOzGtWccxe17dtbS1c16M2OryJZPJ3z-eYhEJYiSLHxEZLnUJ8yfBmI",
        "productId": "abc",
        "platform": "google"
}
```

### Roku

The receiept string represents the transaction returned from a channel or
product purchase.

A developer ID is required.

**The response**

The response passed back to your callback will also be Roku specific. The entire
parsed receipt will be in the result object:

```json
{
	"receipt": {
		"errorCode": null,
		"errorDetails": null,
		"errorMessage": "",
		"status": 0,
		"amount": 4.99,
		"cancelled": false,
		"channelId": 70391,
		"channelName": "abc",
		"couponCode": null,
		"currency": "usd",
		"expirationDate": 1488337344000,
		"originalPurchaseDate": 1483153344000,
		"partnerReferenceId": null,
		"productId": "5KAZUPGB.0RF0",
		"productName": "BASIC - US MONTHLY",
		"purchaseDate": 1483153344000,
		"quantity": 1,
		"rokuCustomerId": "5e56c4c4d7d1504f813c630c2790e54a",
		"tax": 0,
		"total": 0,
		"transactionId": "380e9932-ed9a-48e8-bd66-a6ec00b5efd1"
	},
	"transactionId": "380e9932-ed9a-48e8-bd66-a6ec00b5efd1",
	"productId": "abc",
	"platform": "roku"
}
```

### All Platforms

Regardless of the platform used, besides the platform-specific receipt, the following properties
will be included:

* transactionId, to uniquely identify this transaction.
* productId, which specifies what was purchased.
* platform, which is always the platform you passed.


## License

MIT

## References

### Apple References
**Code Inspiration**

 * https://github.com/pcrawfor/iap_verifier

**API Reference**

 * 	https://developer.apple.com/library/ios/releasenotes/General/ValidateAppStoreReceipt/Chapters/ValidateRemotely.html


### Google Play References
**Code Inspiration**

 * https://bitbucket.org/gooroo175/google-play-purchase-validator/src/d88278c30df0d0dc51b852b7bcab5f40e3a30923/index.js?at=master
 * https://github.com/machadogj/node-google-bigquery
 * https://github.com/extrabacon/google-oauth-jwt/blob/master/lib/request-jwt.js

**API Reference**

 * https://developer.android.com/google/play/billing/gp-purchase-status-api.html
 * https://developers.google.com/android-publisher/
 * https://developers.google.com/android-publisher/getting_started
 * https://developers.google.com/android-publisher/authorization
 * https://developers.google.com/accounts/docs/OAuth2ServiceAccount
 * https://developers.google.com/android-publisher/api-ref/purchases/products
 * https://developers.google.com/android-publisher/api-ref/purchases/products/get
 * http://developer.android.com/google/play/billing/billing_testing.html
 * http://stackoverflow.com/questions/24323207/use-service-account-to-verify-google-inapppurchase

**Receipt Generation**

 * http://developer.android.com/training/in-app-billing/preparing-iab-app.html
 * http://developer.android.com/tools/publishing/app-signing.html
 * http://developer.android.com/google/play/billing/api.html#managed

### Roku References

**API Reference**

 * https://sdkdocs.roku.com/display/sdkdoc/Web+Service+API#WebServiceAPI-/listen/transaction-service.svc/validate-transaction/{devtoken}/{transactionid}
