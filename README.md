# Angular Payments

An Angular Module that provides directives for *formatting* and *validating* forms related to payments. Also, it ships with a directive that makes it easy to integrate with Stripe's wonderful stripe.js.

### Credits

This library wasn't just heavily inspired by Stripe's jQuery.payments, but is in fact mostly just a port of it to a more AngularJS-oriented style.

Also, stripeForm is pretty much directly from gtramontina's Stripe Angular: https://github.com/gtramontina/stripe-angular

All I did was port and combine these great libraries. Cheers!

## Usage

To use Angular Payments, add angularPayments as a dependency to your AngularJS module or app.

Angular Payments it self depends on 2 libraries:

1. Angular (d'oh)
2. Stripe.js (https://stripe.com/docs/stripe.js)

Be sure to also configure Stripe by setting your publishable key, something like:

	<script type="text/javascript" src="https://js.stripe.com/v2/"></script>
	<script>
		Stripe.setPublishableKey('YOUR_PUBLISHABLE_KEY');
	</script>

The module ships 3 directives, all of which should be added as attributes to elements. 

### paymentsValidate

Is used for validating fields on the client side. Usage:

	<input type="text" ng-model="blah" payments-validate="VALIDATION_TYPE" />

For validation to work, element must have an associated ng-model -value.

Possible validation types are:


#### card

	<input type="text" ng-model="number" payments-validate="card" />

#### expiry

	<input type="text" ng-model="expiry" payments-validate="expiry" />

Expiry actually matches, that a string with format mm / yy[yy] is a valid and non-expired date. It's pretty cool when combined with matching formatting. Again, ported from jQuery.payments.

#### cvc

	<input type="text" ng-model="cvc" payments-validate="cvc" />


### paymentsFormat

Is used for formatting fields.

	<input type="text" payments-format="FORMATTING_TYPE" />

Possible formats:

#### card

	<input type="text" payments-format="card" />

- After every 4th character a space (" ") character is added
- Maximum 16 characters (excluding those spaces)
- Only digits

#### Expiry

	<input type="text" payments-format="expiry" />

- Essentially "mm / yyyy"
- After two digits for months, insert slash ("/")
- Accept only digits and at most 6 of them (excluding the slash)

#### cvc

	<input type="text" payments-format="expiry" />

- Limit to 4 digits
- *Could also be used to match with card type, but this is not implemented yet.*

### stripeForm

Intercepts form-submission, obtains stripeToken and then fires a callback. Essentially abstracts away what you would do manually when following instructions at https://stripe.com/docs/stripe.js

	<form stripe-form="CALLBACK"> 
	...
	</form>

Instead of sending the form and annotating it with data-stripe -attributes, you should use form's scope, i.e. attach values to form field's using ng-model. Values that are in the scope and that match to values that Stripe accepts, are sent. So if in addition to the formattable and validateable fields you want to send `address_state`, just add `<input type="text" ng-model="addressState" />` to your form.

**Important:** expiry makes a small exception. If you haven't explicitly defined `$scope.expMonth` and `$scope.expYear`, we take `$scope.expiry` and parse it into a month and year assuming mm / yy[yy] format that is produced by `payments-format="expiry"`.

When Stripe responds, it passes results to a callback function, which could be:

	$scope.handleStripe = function(status, response){
		if(response.error) {
			// there was an error. Fix it.
		} else {
			// got stripe token, now charge it or smt
			token = response.id
		}
	}

And then:

	<form stripe-form="handleStripe">
	...

Basically the directive sends the credit card details directly to stripe, which then returns a token that you can use to charge the card, subscribe a user or to do other things. This ensures that the card details themselves never hit your backend and thus you have to worry a little bit less.


## Example

See example-folder. Also, there's a demo at:

https://angularstripe-docoye.backliftapp.com/example/


## Contributors

Please Edit files in `src/`-folder and before submitting pull request, run grunt to compile and minify files in `lib`-folder.

Despite of slow response times, all patches, bugfixes and features are more and welcome and much appreciated. Thanks to all who have and will contribute! :)

## License 

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.



