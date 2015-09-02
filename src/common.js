angular.module('angularPayments')

.factory('Common', [function(){

  var ret = {};


  // expiry is a string "mm / yy[yy]"
  ret['parseExpiry'] = function(value){
    var month, prefix, year, _ref;

    value = value || '';

    value = value.replace(/\s/g, '');
    _ref = value.split('/', 2), month = _ref[0], year = _ref[1];

    if ((year != null ? year.length : void 0) === 2 && /^\d+$/.test(year)) {
      prefix = (new Date).getFullYear();
      prefix = prefix.toString().slice(0, 2);
      year = prefix + year;
    }

    month = parseInt(month, 10);
    year = parseInt(year, 10);
    
    return {
      month: month,
      year: year
    };
  };

  return ret;

}])