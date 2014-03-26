angular.module('angularPayments')
.factory('FormDataMiner', function() {
  // data that is sent to stripe is filtered from scope, looking for valid values to
  // send and converting camelCase to snake_case, e.g expMonth -> exp_month


  // filter valid stripe-values from scope and convert them from camelCase to snake_case
   return function(data, exp, otherPossibleKeys){
           
    var possibleKeys = ['number', 'expMonth', 'expYear', 
                    'cvc', 'name','addressLine1', 
                    'addressLine2', 'addressCity',
                    'addressState', 'addressZip',
                    'addressCountry']

    for (i in otherPossibleKeys) {
      possibleKeys.push(otherPossibleKeys[i]);
    }
    
    var camelToSnake = function(str){
      return str.replace(/([A-Z])/g, function(m){
        return "_"+m.toLowerCase();
      });
    }

    var ret = {};

    for(i in possibleKeys){
        if(possibleKeys.hasOwnProperty(i)) {
          if (data[possibleKeys[i]]){
            ret[camelToSnake(possibleKeys[i])] = angular.copy(data[possibleKeys[i]].$modelValue);
          } else if (exp[possibleKeys[i]]) {
            ret[camelToSnake(possibleKeys[i])] = angular.copy(exp[possibleKeys[i]]);
          }
        }
    }

    ret['number'] = (ret['number'] || '').replace(/ /g,'');

    return ret;
  }
})
.directive('stripeForm', ['$window', '$parse', 'Common', 'FormDataMiner', function($window, $parse, Common, FormDataMiner) {
    
  // directive intercepts form-submission, obtains Stripe's cardToken using stripe.js
  // and then passes that to callback provided in stripeForm, attribute.

  return {
    restrict: 'A',
    link: function(scope, elem, attr) {

      if(!$window.Stripe){
          throw 'stripeForm requires that you have stripe.js installed. Include https://js.stripe.com/v2/ into your html.';
      }

      var form = angular.element(elem),
          formValues = scope[attr.name];

      form.bind('submit', function() {

        expMonthUsed = scope.expMonth ? true : false;
        expYearUsed = scope.expYear ? true : false;

        if(!(expMonthUsed && expYearUsed)){
          if (formValues.expiry && formValues.expiry.$modelValue) {
            exp = Common.parseExpiry(formValues.expiry.$modelValue);
            expiry = {
              expMonth: exp.month,
              expYear: exp.year
            }
          }
        }

        var button = form.find('button');
        button.prop('disabled', true);

        if(form.hasClass('ng-valid')) {
          
          $window.Stripe.createToken(FormDataMiner(scope[attr.name], expiry), function() {
            var args = arguments;
            scope.$apply(function() {
              scope[attr.stripeForm].apply(scope, args);
            });
            button.prop('disabled', false);

          });

        } else {
          scope.$apply(function() {
            scope[attr.stripeForm].apply(scope, [400, {error: 'Invalid form submitted.'}]);
          });
          button.prop('disabled', false);
        }

        scope.expiryMonth = expMonthUsed ? scope.expMonth : null;
        scope.expiryYear = expYearUsed ? scope.expMonth : null;

      });
    }
  }
}])
.directive('recurlyForm', ['$window', '$parse', 'FormDataMiner', 'Common', function($window, $parse, FormDataMiner, Common) {
  return {
    restrict: 'A',
    link: function(scope, elem, attr) {
      if(!$window.Recurly){
          throw 'recurlyForm requires that you have recurly.js installed.';
      }

      // From recurly.js
      var createObject = function(o) {
        var F;
        F = function() {};
        F.prototype = o;
        return new F();
      };

      var form = angular.element(elem),
          formValues = scope[attr.name];

      form.bind('submit', function() {

        expMonthUsed = scope.expMonth ? true : false;
        expYearUsed = scope.expYear ? true : false;

        if(!(expMonthUsed && expYearUsed)){
          if (formValues.expiry && formValues.expiry.$modelValue) {
            exp = Common.parseExpiry(formValues.expiry.$modelValue);
            expiry = {
              expMonth: exp.month,
              expYear: exp.year
            }
          }
        }

        var button = form.find('button');
        button.prop('disabled', true);

        if(form.hasClass('ng-valid')) {
          
          var obj = FormDataMiner(scope[attr.name], expiry, [
            'signature', 'currency', 'plan', 'quantity', 'company_name',
            'email', 'plan_code', 'account_code'
          ]);
          if (!obj.currency) obj.currency = 'USD';

          var first_name, last_name, _ref,
            __slice = [].slice;

          if (obj.name) {
            _name = obj.name.split(" ")
            obj.first_name = _name[0]
            obj.last_name = (2 <= _name.length) ? [].slice.call(_name, 1) : []
            obj.last_name = obj.last_name.join(" ")
          }

          // First, create account object
          account = createObject(Recurly.Account)
          account.firstName = obj.first_name
          account.lastName = obj.last_name
          account.companyName = obj.company_name
          account.email = obj.email
          account.account_code = obj.account_code

          // Plan
          plan = createObject(Recurly.Plan)
          plan.plan_code = obj.plan_code
          plan.quantity = obj.quantity

          // Billing
          billing = createObject(Recurly.BillingInfo)
          billing.firstName = obj.first_name
          billing.lastName = obj.last_name
          billing.address1 = obj.address_line1
          billing.address2 = obj.address_line2
          billing.city = obj.address_city
          billing.zip = obj.address_zip
          billing.state = obj.address_state
          billing.country = obj.address_country
          billing.number = obj.number
          billing.month = obj.exp_month
          billing.year = obj.exp_year
          billing.cvv = obj.cvc

          // Subscription
          subscription = createObject(Recurly.Subscription)
          subscription.plan        = plan
          subscription.account     = account
          subscription.billingInfo = billing

          subscription.save({
            signature: obj.signature,
            success: function(resp) {
              console.log("SUCCESS", resp);
              var args = arguments;
              scope.$apply(function() {
                scope[attr.recurlyForm].apply(scope, args);
              });
              button.prop('disabled', false);
            },
            error: function(reason) {
              scope[attr.recurlyForm].apply(scope, [400, {error: reason}]);
              button.prop('disabled', false);
            }
          });

        } else {
          scope.$apply(function() {
            scope[attr.stripeForm].apply(scope, [400, {error: 'Invalid form submitted.'}]);
          });
          button.prop('disabled', false);
        }

        scope.expiryMonth = expMonthUsed ? scope.expMonth : null;
        scope.expiryYear = expYearUsed ? scope.expMonth : null;

      });
    }
  }
}])
