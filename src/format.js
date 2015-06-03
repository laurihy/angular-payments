/**
 * Format
 */
angular.module('angularPayments')

.factory('_Format', ['Cards', 'Common', '$filter', function(Cards, Common, $filter){

  var _formats = {};

  var _hasTextSelected = function($target) {
      var ref;
      
      if (($target.prop('selectionStart') !== null) && $target.prop('selectionStart') !== $target.prop('selectionEnd')) {
          return true;
      }
      
      if (document.selection) {
          return true;
      }
      
      return false;
    };

  // card formatting

  var isInvalidKey = function(e) {
    var digit = String.fromCharCode(e.which);
    return !/^\d+$/.test(digit) && !e.metaKey && e.charCode !== 0 && !e.ctrlKey;
  };

  var _formatCardNumber = function(e) {
      var $target, card, digit, length, re, upperLength, value;
      
      digit = String.fromCharCode(e.which);
      $target = angular.element(e.currentTarget);
      value = $target.val();
      card = Cards.fromNumber(value + digit);
      length = (value.replace(/\D/g, '') + digit).length;
      
      upperLength = 16;

      // Catch delete, tab, backspace, arrows, etc..
      if (e.which === 8 || e.which === 0) {
        return;
      }

      if (card) {
        upperLength = card.length[card.length.length - 1];
      }
      

      if (isInvalidKey(e)) {
        e.preventDefault();
        return;
      }

      if (($target.prop('selectionStart') !== null) && $target.prop('selectionStart') !== value.length) {
        return;
      }

      re = Cards.defaultInputFormat();
      if (card) {
          re = card.inputFormat;
      }

      if (length >= upperLength) {
        return;
      }

      if (re.test(value)) {
        e.preventDefault();
        return $target.val(value + ' ' + digit);

      } else if (re.test(value + digit)) {
        e.preventDefault();
        return $target.val(value + digit + ' ');
      }
  };

  var _restrictCardNumber = function(e) {
      var $target, card, digit, value;
      
      $target = angular.element(e.currentTarget);
      digit = String.fromCharCode(e.which);
      
      // Catch delete, tab, backspace, arrows, etc..
      if (e.which === 8 || e.which === 0) {
        return;
      }

      if(!/^\d+$/.test(digit)) {
        e.preventDefault();
        return;
      }
      
      if(_hasTextSelected($target)) {
        return;
      }
      
      value = ($target.val() + digit).replace(/\D/g, '');
      card = Cards.fromNumber(value);
      
      if(card) {
        if(value.length > card.length[card.length.length - 1]){
          e.preventDefault();
        }
      } else {
        if(value.length > 16){
          e.preventDefault();
        }
      }
  };

  var _formatBackCardNumber = function(e) {
      var $target, value;
      
      $target = angular.element(e.currentTarget);
      value = $target.val();
      
      if(e.metaKey) {
        return;
      }
      
      if(e.which !== 8) {
        return;
      }
      
      if(($target.prop('selectionStart') !== null) && $target.prop('selectionStart') !== value.length) {
        return;
      }
      
      if(/\d\s$/.test(value) && !e.metaKey && e.keyCode >= 46) {
        e.preventDefault();
        return $target.val(value.replace(/\d\s$/, ''));
      } else if (/\s\d?$/.test(value)) {
        e.preventDefault();
        return $target.val(value.replace(/\s\d?$/, ''));
      }
    };

  var _getFormattedCardNumber = function(num) {
      var card, groups, upperLength, ref;
      
      card = Cards.fromNumber(num);
      
      if (!card) {
        return num;
      }
      
      upperLength = card.length[card.length.length - 1];
      num = num.replace(/\D/g, '');
      num = num.slice(0, +upperLength + 1 || 9e9);
      
      if(card.format.global) {
        return (ref = num.match(card.format)) !== null ? ref.join(' ') : void 0;
      } else {
        groups = card.format.exec(num);
          
        if (groups !== null) {
          groups.shift();
        }

        return groups !== null ? groups.join(' ') : void 0;
      }
    };

  var _reFormatCardNumber = function(e) {
    return setTimeout(function() {
      var $target, value;
      $target = angular.element(e.target);
    
      value = $target.val();
      value = _getFormattedCardNumber(value);
      return $target.val(value);
    });
  };

  var _parseCardNumber = function(value) {
    return value !== null && value !== undefined ? value.replace(/\s/g, '') : value;
  };

  _formats.card = function(elem, ctrl){
    elem.bind('keypress', _restrictCardNumber);
    elem.bind('keypress', _formatCardNumber);
    elem.bind('keydown', _formatBackCardNumber);
    elem.bind('paste', _reFormatCardNumber);

    ctrl.$parsers.push(_parseCardNumber);
    ctrl.$formatters.push(_getFormattedCardNumber);
  };


  // cvc

  var _formatCVC = function(e){
    var $target, digit, value;

    $target = angular.element(e.currentTarget);
    digit = String.fromCharCode(e.which);

    // Catch delete, tab, backspace, arrows, etc..
    if (e.which === 8 || e.which === 0) {
      return;
    }

    if (isInvalidKey(e)) {
      e.preventDefault();
      return;
    }

    if(_hasTextSelected($target)) {
      return;
    }

    value = $target.val() + digit;
    
    if(value.length <= 4){
      return;
    } else {
      e.preventDefault();
      return;
    }
  };

  _formats.cvc = function(elem){
    elem.bind('keypress', _formatCVC);
  };


  // expiry

  var _restrictExpiry = function(e) {
    var $target, digit, value;
    
    $target = angular.element(e.currentTarget);
    digit = String.fromCharCode(e.which);
    
    if (isInvalidKey(e)) {
      e.preventDefault();
      return;
    }
    
    if(_hasTextSelected($target)) {
      return;
    }
    
    value = $target.val() + digit;
    value = value.replace(/\D/g, '');
    
    if (value.length > 6) {
      e.preventDefault();
      return;
    }
  };

  var _formatExpiry = function(e) {
    var $target, digit, val;
    
    digit = String.fromCharCode(e.which);
    
    if (isInvalidKey(e)) {
      e.preventDefault();
      return;
    }
    
    $target = angular.element(e.currentTarget);
    val = $target.val() + digit;
    
    if (/^\d$/.test(val) && (val !== '0' && val !== '1')) {
      e.preventDefault();
      return $target.val("0" + val + " / ");

    } else if (/^\d\d$/.test(val)) {
      e.preventDefault();
      return $target.val("" + val + " / ");

    }
  };

  var _formatForwardExpiry = function(e) {
    var $target, digit, val;
    
    digit = String.fromCharCode(e.which);
    
    if (isInvalidKey(e)) {
      return;
    }
    
    $target = angular.element(e.currentTarget);
    val = $target.val();
    
    if (/^\d\d$/.test(val)) {
      return $target.val("" + val + " / ");
    }
  };

  var _formatForwardSlash = function(e) {
    var $target, slash, val;
    
    slash = String.fromCharCode(e.which);
    
    if (slash !== '/') {
      return;
    }
    
    $target = angular.element(e.currentTarget);
    val = $target.val();
    
    if (/^\d$/.test(val) && val !== '0') {
      return $target.val("0" + val + " / ");
    }
  };

  var _formatBackExpiry = function(e) {
    var $target, value;
    
    if (e.meta || e.metaKey) {
      return;
    }
    
    $target = angular.element(e.currentTarget);
    value = $target.val();
    
    if (e.which !== 8) {
      return;
    }
    
    if (($target.prop('selectionStart') !== null) && $target.prop('selectionStart') !== value.length) {
      return;
    }
    
    if (/\d(\s|\/)+$/.test(value)) {
      e.preventDefault();
      return $target.val(value.replace(/\d(\s|\/)*$/, ''));

    } else if (/\s\/\s?\d?$/.test(value)) {
      e.preventDefault();
      return $target.val(value.replace(/\s\/\s?\d?$/, ''));

    }
  };

  var _parseExpiry = function(value) {
    if(value !== null) {
      var obj = Common.parseExpiry(value);
      var expiry = new Date(obj.year, obj.month-1);
      return $filter('date')(expiry, 'MM/yyyy');
    }
    return null;
  };

  var _getFormattedExpiry = function(value) {
    if(value !== null) {
      var obj = Common.parseExpiry(value);
      var expiry = new Date(obj.year, obj.month-1);
      return $filter('date')(expiry, 'MM / yyyy');
    }
    return null;
  };


  _formats.expiry = function(elem, ctrl){
    elem.bind('keypress', _restrictExpiry);
    elem.bind('keypress', _formatExpiry);
    elem.bind('keypress', _formatForwardSlash);
    elem.bind('keypress', _formatForwardExpiry);
    elem.bind('keydown', _formatBackExpiry);

    ctrl.$parsers.push(_parseExpiry);
    ctrl.$formatters.push(_getFormattedExpiry);
  };

  return function(type, elem, ctrl){
    var types, errstr;

    if(!_formats[type]){

      types = Object.keys(_formats);

      errstr  = 'Unknown type for formatting: "'+type+'". ';
      errstr += 'Should be one of: "'+types.join('", "')+'"';

      throw errstr;
    }
    return _formats[type](elem, ctrl);
  };

}])

.directive('paymentsFormat', ['$window', '_Format', function($window, _Format){
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, elem, attr, ctrl){
        _Format(attr.paymentsFormat, elem, ctrl);
      }
    };
}]);
