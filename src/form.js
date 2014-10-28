angular.module('angularPayments')

.directive('stripeForm', ['$window', '$parse', 'Common', function($window, $parse, Common) {

  // directive intercepts form-submission, obtains Stripe's cardToken using stripe.js
  // and then passes that to callback provided in stripeForm, attribute.

  // data that is sent to stripe is filtered from scope, looking for valid values to
  // send and converting camelCase to snake_case, e.g expMonth -> exp_month


  // filter valid stripe-values from scope and convert them from camelCase to snake_case
  _getDataToSend = function(data){

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

      if(!$window.Stripe){
          throw 'stripeForm requires that you have stripe.js installed. Include https://js.stripe.com/v2/ into your html.';
      }

      var form = angular.element(elem);
      var isProcessing = false;

      form.bind('submit', function() {
        if (isProcessing === true) return;

        exp = Common.parseExpiry(scope.expiry)
        scope.expMonth = exp.month
        scope.expYear = exp.year

        var button = form.find('button');
        // btn-auto-disabled
        // 0: disable button, 1: do not disable button, 2: keep disable
        var autoDisable = ~~button.attr('btn-auto-disabled');
        if (autoDisable === 0 && autoDisable === 2) {
            button.prop('disabled', true);
        }
        isProcessing = true;

        if(form.hasClass('ng-valid')) {

          $window.Stripe.createToken(_getDataToSend(scope), function() {
            var args = arguments;
            scope.$apply(function() {
              scope[attr.stripeForm].apply(scope, args);
            });
            if (autoDisable === 0) {
                button.prop('disabled', false);
            }
            isProcessing = false;
          });

        } else {
          var errorItem = [];
          if (form.hasClass('ng-invalid-card')) errorItem.push('Credit Card');
          if (form.hasClass('ng-invalid-expiry')) errorItem.push('Expiry');
          if (form.hasClass('ng-invalid-cvc')) errorItem.push('CVC');
          if (form.hasClass('ng-invalid-required')) errorItem.push('Missing required fields');
          var errorMessage = 'Invalid form submitted: ' + errorItem.join(', ');

          scope.$apply(function() {
            scope[attr.stripeForm].apply(scope, [400, {error: errorMessage }]);
          });
          if (autoDisable === 0) {
              button.prop('disabled', false);
          }
          isProcessing = false;
        }

      });
    }
  }
}])
