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

### Initialisation

```javascript
var iap = require('iap');

var platform = 'apple';
var payment = {
	receipt: 'receipt data', // always required
	productId: 'abc',
	packageName: 'my.app',
	secret: 'password',
	subscription: true,	// optional, if google play subscription
	keyObject: {}, // required, if google
	userId: 'user id', // required, if amazon
	devToken: 'developer id' // required, if roku
};
```

### Purchase verification ( all platforms )

A method is exposed to verify purchase receipts:

```javascript
iap.verifyPayment(platform, payment, function (error, response) {
	/* your code */
});
```

Or, if you prefer a promise-based alternative: 

```javascript
iap.verifyPayment(platform, payment)
.then(
    response => {	
        /* your code */ 
    },
    error => {
        /* your code */ 
    }
)
```

The receipt you pass must conform to the requirements of the backend you are verifying with. Read
the next chapter for more information on the format.

### Subscription cancellation ( Google Play only )

Google exposes [an API for server side cancellation](https://developers.google.com/android-publisher/api-ref/purchases/subscriptions/cancel) of recurring suscriptions. This might be
be used to enable users to easily cancel subscriptions from within the app ( without going
to Play Store ), or to allow subscriptions to be canceled by support people when users request
it ( when for some reason the users are unable or unwilling to do so themselves).

```javascript
iap.cancelSubscription("google", payment, function (error, response) {
	/* your code */
});
```

Or, if you prefer a promise-based alternative: 

```javascript
iap.cancelSubscription(platform, payment)
.then(
    response => {    
        /* your code */ 
    },
    error => {
        /* your code */ 
    }
)
```

## Supported platforms

### Amazon

**The payment object**

The receipt string represents the transaction returned from a channel or product
purchase.

A Shared secret and user ID is required.

**The response**

The response passed back to your callback will also be Amazon specific. The entire parsed receipt
will be in the result object:

```json
{
	"receipt": {
		"betaProduct": false,
		"cancelDate": null,
		"parentProductId": null,
		"productId": "com.amazon.iapsamplev2.gold_medal",
		"productType": "CONSUMABLE",
		"purchaseDate": 1399070221749,
		"quantity": 1,
		"receiptId": "wE1EG1gsEZI9q9UnI5YoZ2OxeoVKPdR5bvPMqyKQq5Y=:1:11",
		"renewalDate": null,
		"term": null,
		"termSku": null,
		"testTransaction": false
	},
	"transactionId": "wE1EG1gsEZI9q9UnI5YoZ2OxeoVKPdR5bvPMqyKQq5Y=:1:11",
	"productId": "com.amazon.iapsamplev2.gold_medal",
	"platform": "amazon"
}
```

### Apple

**The payment object**

The receipt string passed may be either the base64 string that Apple really wants, or the decoded
receipt as returned by the iOS SDK (in which case it will be automatically base64 serialized).

Both productId and packageName (bundle ID) are optional, but when provided will be tested against.
If the receipt does not match the provided values, an error will be returned.

To verify auto-renewable subscriptions you need to provide `secret` field that
contains your In-App Purchase Shared Secret

Apple supports returning only the most recent transaction for auto-renewable subscriptions via their [exclude-old-transactions](https://developer.apple.com/library/content/releasenotes/General/ValidateAppStoreReceipt/Chapters/ValidateRemotely.html) option. This can greatly save on bandwidth for users that have more than one transaction. To enable this, pass `excludeOldTransactions` on the payment object:

```javascript
let payment = {
  ...
  excludeOldTransactions: true
}
```

**The response**

The response passed back to your callback will also be Apple specific. The entire parsed receipt
will be in the result object. Applications that support monthly and yearly
subscription access will represent auto-renewable terms in either the `in_app`
or `latestReceiptInfo` property.

```json
{
	"receipt": {
		"original_purchase_date_pst": "2016-10-29 15:46:57 America/Los_Angeles",
		"purchase_date_ms": "1477802802000",
		"unique_identifier": "78abf2209323434771637ee22f0ee8b8341f14b4",
		"original_transaction_id": "120000257973875",
		"bvrs": "0.0.1",
		"transaction_id": "120000265421254",
		"quantity": "1",
		"unique_vendor_identifier": "206FED24-2EAB-4FC6-B946-4AF61086DF21",
		"item_id": "820817285",
		"product_id": "abc",
		"purchase_date": "2016-10-29 22:46:57 Etc/GMT",
		"original_purchase_date": "2016-10-29 22:46:57 Etc/GMT",
		"purchase_date_pst": "2016-10-29 15:46:57 America/Los_Angeles",
		"bid": "test.myapp",
		"original_purchase_date_ms": "1477781217000",
		"in_app": [
			{
				"quantity": "1",
				"product_id": "abc",
				"transaction_id": "120000265421254",
				"original_transaction_id": "120000257973875",
				"purchase_date": "2016-10-30 04:46:42 Etc/GMT",
				"purchase_date_ms": "1477802802000",
				"purchase_date_pst": "2016-10-29 21:46:42 America/Los_Angeles",
				"original_purchase_date": "2016-10-29 22:46:57 Etc/GMT",
				"original_purchase_date_ms": "1477781217000",
				"original_purchase_date_pst": "2016-10-29 15:46:57 America/Los_Angeles",
				"expires_date": "2016-11-30 05:46:42 Etc/GMT",
				"expires_date_ms": "1480484802000",
				"expires_date_pst": "2016-11-29 21:46:42 America/Los_Angeles",
				"web_order_line_item_id": "820817285",
				"is_trial_period": "false"
			},
		]
	},
	"latestReceiptInfo": [
		{
			"quantity": "1",
			"product_id": "abc",
			"transaction_id": "120000233230473",
			"original_transaction_id": "120000233230473",
			"purchase_date": "2016-06-12 22:36:58 Etc/GMT",
			"purchase_date_ms": "1465771018000",
			"purchase_date_pst": "2016-06-12 15:36:58 America/Los_Angeles",
			"original_purchase_date": "2016-06-12 22:36:58 Etc/GMT",
			"original_purchase_date_ms": "1465771018000",
			"original_purchase_date_pst": "2016-06-12 15:36:58 America/Los_Angeles",
			"expires_date": "2016-07-12 22:36:58 Etc/GMT",
			"expires_date_ms": "1468363018000",
			"expires_date_pst": "2016-07-12 15:36:58 America/Los_Angeles",
			"web_order_line_item_id": "120000034778618",
			"is_trial_period": "true"
		},
	],
	"pendingRenewalInfo": [
		{
		  "expiration_intent": "1",
 			"auto_renew_product_id": "abc",
			"original_transaction_id": "120000233230473",
			"is_in_billing_retry_period": "0",
			"product_id": "abc",
			"auto_renew_status": "0"
		}
	],
	"transactionId": "120000233230473",
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

| Property | Type | Description |
| --- | --- | --- |
| receipt | object | Data returned by platforms |
| platform | string | One of: 'apple', 'google', 'amazon', 'roku' |
| productId | string | Id of the product |
| transactionId | string | Id to uniquely identify transaction |
| purchaseDate | int | Date of purchase in millis  |
| expirationDate | int | Date of expiration in millis |


## License

MIT

## References

### Amazon References
**Code Inspiration**

 * https://github.com/may215/amazon_iap

**API Reference**

 * https://developer.amazon.com/public/apis/earn/in-app-purchasing/docs-v2/verifying-receipts-in-iap

### Apple References
**Code Inspiration**

 * https://github.com/pcrawfor/iap_verifier

**API Reference**

 * 	https://developer.apple.com/library/ios/releasenotes/General/ValidateAppStoreReceipt/Chapters/ValidateRemotely.html

### Google Play References
**Code Inspiration**

 * https://www.npmjs.com/package/google-play-purchase-validator
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
