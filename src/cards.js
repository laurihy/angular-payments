angular.module('angularPayments')

.factory('Cards', [function(){

  var defaultFormat = /(\d{1,4})/g;
  var defaultInputFormat =  /(?:^|\s)(\d{4})$/;

        var cards = [
    {
      type: 'maestro',
      pattern: /^(5018|5020|5038|6304|6759|676[1-3])/,
      format: defaultFormat,
      inputFormat: defaultInputFormat,
      length: [12, 13, 14, 15, 16, 17, 18, 19],
      cvcLength: [3],
      luhn: true
    }, {
      type: 'dinersclub',
      pattern: /^3[0689]/,
      format: /(\d{1,4})(\d{1,6})?(\d{1,4})?/,
      inputFormat: defaultInputFormat,
      length: [14],
      cvcLength: [3],
      luhn: true
    }, {
      type: 'laser',
      pattern: /^(6706|6771|6709)/,
      format: defaultFormat,
      inputFormat: defaultInputFormat,
      length: [16, 17, 18, 19],
      cvcLength: [3],
      luhn: true
    }, {
      type: 'jcb',
      pattern: /^35/,
      format: defaultFormat,
      inputFormat: defaultInputFormat,
      length: [16],
      cvcLength: [3],
      luhn: true
    }, {
      type: 'unionpay',
      pattern: /^62/,
      format: defaultFormat,
      inputFormat: defaultInputFormat,
      length: [16, 17, 18, 19],
      cvcLength: [3],
      luhn: false
    }, {
      type: 'discover',
      pattern: /^(6011|65|64[4-9]|622)/,
      format: defaultFormat,
      inputFormat: defaultInputFormat,
      length: [16],
      cvcLength: [3],
      luhn: true
    }, {
      type: 'mastercard',
      pattern: /^5[1-5]/,
      format: defaultFormat,
      inputFormat: defaultInputFormat,
      length: [16],
      cvcLength: [3],
      luhn: true
    }, {
      type: 'amex',
      pattern: /^3[47]/,
      format: /(\d{1,4})(\d{1,6})?(\d{1,5})?/,
      inputFormat: /^(\d{4}|\d{4}\s\d{6})$/,
      length: [15],
      cvcLength: [3, 4],
      luhn: true
    }, {
      type: 'visa',
      pattern: /^4/,
      format: defaultFormat,
      inputFormat: defaultInputFormat,
      length: [13, 14, 15, 16],
      cvcLength: [3],
      luhn: true
    }
  ];


  var _fromNumber = function(num){
      var card, i, len;

      num = (num + '').replace(/\D/g, '');

      for (i = 0, len = cards.length; i < len; i++) {

        card = cards[i];

        if (card.pattern.test(num)) {
          return card;
        }

      }
  }

  var _fromType = function(type) {
      var card, i, len;

      for (i = 0, len = cards.length; i < len; i++) {

        card = cards[i];
        
        if (card.type === type) {
          return card;
        }

      }
  };

  return {
      fromNumber: function(val) { return _fromNumber(val) },
      fromType: function(val) { return _fromType(val) },
      defaultFormat: function() { return defaultFormat;},
      defaultInputFormat: function() { return defaultInputFormat;}
  }

}])
