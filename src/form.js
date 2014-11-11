

var form_directive = function (token_function, Common, handler_attr) {

  // directive intercepts form-submission, obtains Stripe's cardToken using stripe.js
  // and then passes that to callback provided in stripeForm, attribute.

  // data that is sent to stripe is filtered from scope, looking for valid values to
  // send and converting camelCase to snake_case, e.g expMonth -> exp_month

  // filter valid stripe-values from scope and convert them from camelCase to snake_case
  var _getDataToSend = function(data){

    var possibleKeys = ['number', 'expMonth', 'expYear',
                    'cvc', 'name','addressLine1',
                    'addressLine2', 'addressCity',
                    'addressState', 'addressZip',
                    'addressCountry']

    var camelToSnake = function(str){
      return str.replace(/([A-Z])/g, function(m){
        return "_"+m.toLowerCase();
      });
    }

    var ret = {};

    for(i in possibleKeys){
        if(possibleKeys.hasOwnProperty(i)){
            ret[camelToSnake(possibleKeys[i])] = angular.copy(data[possibleKeys[i]]);
        }
    }

    ret['number'] = (ret['number'] || '').replace(/ /g,'');

    return ret;
  }

  return {
    restrict: 'A',
    link: function(scope, elem, attr) {

      var form = angular.element(elem);

      form.bind('submit', function() {

        expMonthUsed = scope.expMonth ? true : false;
        expYearUsed = scope.expYear ? true : false;

        if(!(expMonthUsed && expYearUsed)){
          exp = Common.parseExpiry(scope.expiry)
          scope.expMonth = exp.month
          scope.expYear = exp.year
        }

        var button = form.find('button');
        button.prop('disabled', true);

        if(form.hasClass('ng-valid') ||
           attr.hasOwnProperty("paymentVerifyServerSide")) {

          token_function(_getDataToSend(scope), function() {
            var args = arguments;
            scope.$apply(function() {
              scope[attr[handler_attr]].apply(scope, args);
            });
            button.prop('disabled', false);

          });

        } else {
          scope.$apply(function() {
            scope[attr[handler_attr]].apply(scope, [400, {error: 'Invalid form submitted.'}]);
          });
          button.prop('disabled', false);
        }

        scope.expMonth = null;
        scope.expYear  = null;

      });
    }
  }


}

angular.module('angularPayments')

.directive('stripeForm', ['$window', 'Common', function($window, Common) {
    if(!$window.Stripe){
        throw 'stripeForm requires that you have stripe.js installed. Include https://js.stripe.com/v2/ into your html.';
    }
    return form_directive($window.Stripe.createToken, Common, "stripeForm");
}])

.directive('paymillForm', ['$window', 'Common', function($window, Common) {
    if(!$window.paymill){
        throw 'payMillForm requires that you have the paymill bridge installed. Include https://bridge.paymill.com/ into your html.';
    }
    return form_directive($window.paymill.createToken, Common, "paymillForm");
}]);
