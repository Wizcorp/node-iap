# In-app purchase verification

Inspired by the [iap_verifier](https://github.com/pcrawfor/iap_verifier/) CoffeeScript module
written by Paul Crawford, I wanted a pure JavaScript implementation of in-app purchase verification.
I also wanted to add support for other app stores, and not just limit this to Apple. The `iap`
module is that, and will be extended to app stores other than Apple's (pull requests welcome!).

## Installation

```sh
npm install iap
```

## Usage

Only a single method is exposed to verify purchase receipts:

```javascript
var iap = require('iap');

var platform = 'apple';

iap.verifyReceipt(platform, receiptString, function (error, response) {
	/* your code */
});
```

The receipt you pass must conform to the requirements of the backend you are verifying with. Read
the next chapter for more information on the format.

## Supported platforms

### Apple

The receipt string passed may be either the base64 string that Apple really wants, or the decoded
receipt as returned by the iOS SDK (in which case it will be automatically base64 serialized).

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
                "product_id": "001",
                "purchase_date": "2014-02-25 07:19:49 Etc/GMT",
                "original_purchase_date": "2014-02-25 07:19:49 Etc/GMT",
                "purchase_date_pst": "2014-02-24 23:19:49 America/Los_Angeles",
                "bid": "test.myapp",
                "original_purchase_date_ms": "1393312789954"
        }
}
```

In future versions, we will likely copy particular properties of the receipt into the top level of
the result object, to match with other platforms. That way, you can use the same properties
regardless of the platform used.

## License

MIT
