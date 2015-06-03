describe('Format', function() {
  var scope;
  var changeInputValueTo;
  var cardNumber, cardCvc, cardExpiry;
  var mockCards, mockCommon;

  beforeEach(module('angularPayments'));

  beforeEach(module('angularPayments', function($provide) {
    mockCards = {
      fromNumber: function() {}
    };
    mockCommon = {
      parseExpiry: function() {
        return {
          month: null,
          year: null
        };
      }
    };
    $provide.value('Cards', mockCards);
    $provide.value('Common', mockCommon);
  }));

  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope.$new();

    cardNumber = $compile(
      '<input ng-model="cardNumber" payments-validate="card" payments-format="card"' +
      ' payments-type-model="cardType" type="text">'
    )(scope);

    cardCvc = $compile(
      '<input ng-model="cardCvc" payments-validate="cvc" payments-format="cvc" type="text">'
    )(scope);

    cardExpiry = $compile(
      '<input ng-model="cardExpiration" payments-validate="expiry" payments-format="expiry" type="text">'
    )(scope);

    scope.$digest();
  }));

  beforeEach(inject(function($sniffer) {
    changeInputValueTo = function(input, value) {
      input.val(value);
      input.trigger($sniffer.hasEvent('input') ? 'input' : 'change');
      scope.$digest();
    };
  }));

  afterEach(function() {
    cardNumber.remove();
    cardCvc.remove();
    cardExpiry.remove();
    scope.$destroy();
  });

  it('should initialize with no value', function() {
    expect(cardNumber.val()).toBe('');
    expect(cardCvc.val()).toBe('');
    expect(cardExpiry.val()).toBe('');
  });

});
