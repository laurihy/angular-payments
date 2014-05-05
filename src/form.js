'use strict';

angular.module('angularPayments')
.factory('FormDataMiner', function() {
  // data that is sent to stripe is filtered from scope, looking for valid values to
  // send and converting camelCase to snake_case, e.g expMonth -> exp_month


  // filter valid stripe-values from scope and convert them from camelCase to snake_case
   var mine = function (data, exp, otherPossibleKeys){
           
    var possibleKeys = ['number', 'expMonth', 'expYear', 
                    'cvc', 'name', 'addressLine1', 
                    'addressLine2', 'addressCity',
                    'addressState', 'addressZip',
                    'addressCountry'];

    for (var i in otherPossibleKeys) {
      if (i) {
        possibleKeys.push(otherPossibleKeys[i]);
      }
    }
    
    var camelToSnake = function(str){
      return str.replace(/([A-Z])/g, function(m){
        return '_'+m.toLowerCase();
      });
    };

    var ret = {};

    for(i in possibleKeys){
        if(possibleKeys.hasOwnProperty(i)) {
          if (data.hasOwnProperty(possibleKeys[i])){
            ret[camelToSnake(possibleKeys[i])] = angular.copy(data[possibleKeys[i]].$modelValue);
          } else if (exp && exp[possibleKeys[i]]) {
            ret[camelToSnake(possibleKeys[i])] = angular.copy(exp[possibleKeys[i]]);
          }
        }
    }

    ret.number = (ret.number || '').replace(/ /g,'');

    return ret;
  };

  return {
    mine: mine
  };
})
.directive('stripeForm', ['$window', '$parse', '$rootScope', 'Common', 'FormDataMiner', function($window, $parse, $rootScope, Common, FormDataMiner) {
    
  // directive intercepts form-submission, obtains Stripe's cardToken using stripe.js
  // and then passes that to callback provided in stripeForm, attribute.

  return {
    restrict: 'A',
    link: function(scope, elem, attr) {

      if(!$window.Stripe){
          throw 'stripeForm requires that you have stripe.js installed. Include https://js.stripe.com/v2/ into your html.';
      }

      var form = angular.element(elem),
          formValues = scope[attr.name],
          expiry = {};

      form.bind('submit', function() {

        var expMonthUsed = scope.expMonth ? true : false;
        var expYearUsed = scope.expYear ? true : false;

        if(!(expMonthUsed && expYearUsed)){
          if (formValues.expiry && formValues.expiry.$modelValue) {
            var exp = Common.parseExpiry(formValues.expiry.$modelValue);
            expiry = {
              expMonth: exp.month,
              expYear: exp.year
            };
          }
        }

        var button = form.find('button');
        button.prop('disabled', true);

        if(form.hasClass('ng-valid')) {
          
          $window.Stripe.createToken(FormDataMiner.mine(scope[attr.name], expiry), function() {
            var args = arguments;
            $rootScope.$apply(function() {
              scope[attr.stripeForm].apply(scope, args);
            });
            button.prop('disabled', false);

          });

        } else {
          $rootScope.$apply(function() {
            scope[attr.stripeForm].apply(scope, [400, {error: 'Invalid form submitted.'}]);
          });
          button.prop('disabled', false);
        }

        scope.expiryMonth = expMonthUsed ? scope.expMonth : null;
        scope.expiryYear = expYearUsed ? scope.expMonth : null;

      });
    }
  };
}])
.directive('recurlyForm', ['$window', '$parse', '$rootScope', 'FormDataMiner', 'Common', function($window, $parse, $rootScope, FormDataMiner, Common) {
  return {
    restrict: 'A',
    link: function(scope, elem, attr) {
      if(!$window.recurly){
          throw 'recurlyForm requires that you have recurly.js installed. Please include https://js.recurly.com/v3/recurly.js in your html';
      }

      var form = angular.element(elem),
          formValues = scope[attr.name],
          usePaypal = attr.paypal;

      form.bind('submit', function() {

        var expiry = {};
        // TODO: MOVE THIS
        var expMonthUsed = scope.expMonth ? true : false;
        var expYearUsed = scope.expYear ? true : false;

        if (!(expMonthUsed && expYearUsed)) {
          if (formValues.expiry && formValues.expiry.$modelValue) {
            var exp = Common.parseExpiry(formValues.expiry.$modelValue);
            expiry = {
              expMonth: exp.month,
              expYear: exp.year
            };
          }
        }

        var button = form.find('button');
        button.prop('disabled', true);

        // Function to be run when done
        var doneFn = function(resp) {
          $rootScope.$apply(function() {
            scope[attr.recurlyForm].apply(scope, resp);
          });
          button.prop('disabled', false);
        };

        if (form.hasClass('ng-valid')) {

          var obj = FormDataMiner.mine(scope[attr.name], expiry, [
            'first_name', 'last_name', 'cvv','description'
          ]);
          
          if (!obj.currency) {
            obj.currency = 'USD';
          }

          var first_name, last_name, _ref;
          var __slice = [].slice;

          if (obj.name) {
            var _name = obj.name.split(' ');
            obj.first_name = _name[0];
            obj.last_name = (2 <= _name.length) ? [].slice.call(_name, 1) : [];
            obj.last_name = obj.last_name.join(' ');
          }

          // Check if the form has the option set as true to use
          // storedBillingInfo. Essentially, this is an option to 
          // simply pass the form on to the submit() function, expecting
          // the rest of the app to handle associating payment info
          // in another manner
          if (attr.useStoredBillingInfo && scope[attr.useStoredBillingInfo]) {
            doneFn(obj);
          } else {
            var expiry = {};
            // TODO: MOVE THIS
            var expMonthUsed = scope.expMonth ? true : false;
            var expYearUsed = scope.expYear ? true : false;

            if (!(expMonthUsed && expYearUsed)) {
              if (formValues.expiry && formValues.expiry.$modelValue) {
                var exp = Common.parseExpiry(formValues.expiry.$modelValue);
                expiry = {
                  expMonth: exp.month,
                  expYear: exp.year
                };
              }
            }

            var recurlyFn, recurlyOptions;

            if (usePaypal) {
              recurlyFn = 'paypal';
              recurlyOptions = obj;
            } else {
              recurlyFn = 'token';
              recurlyOptions = {
                first_name: obj.first_name, 
                last_name: obj.last_name,
                number: obj.number,
                cvv: obj.cvc,
                month: (obj.exp_month || '').toString(),
                year: (obj.exp_year || '').toString(),
                zip: obj.zip
              }
            };

            $window.recurly[recurlyFn](recurlyOptions, function(err, token) {
              if (err) {
                doneFn([400, {error: err}]);
              } else {
                var args = arguments;
                doneFn(args);
              }
            });
          }
        } else {
          doneFn([400, {error: 'Invalid form submitted.'}]);
        }

        scope.expiryMonth = expMonthUsed ? scope.expMonth : null;
        scope.expiryYear = expYearUsed ? scope.expMonth : null;

      });
    }
  };
}]);