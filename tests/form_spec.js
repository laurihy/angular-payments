describe('recurlyForm', function() {
  beforeEach(module('angularPayments'));

  var elm, form, scope, 
    compileDirective, 
    recurlyMock = {
      token: function() {}
    },
    handleRecurly = function() {};

  var fillInForm = function(obj, theForm) {
    if (!theForm) theForm = form;

    for (var i in obj) {
      var value = obj[i];
      theForm[i].$setViewValue(value);
    }
  }

  beforeEach(inject(function($rootScope, $compile, _$window_) {
    win = _$window_;
    scope = $rootScope.$new();
    var tpl = '<form recurly-form="handleRecurly" name="myForm">    \
        <label for="">Card number</label>                   \
        <input type="text"                                  \
            name="number"                                   \
            ng-model="payment.number"                       \
            payments-validate="card" payments-format="card" \
            payments-type-model="type"                      \
            ng-class="myForm.number.$card.type"/>           \
        <label for="">Expiry</label>                        \
        <input type="text"                                  \
              name="expiry"                                 \
              ng-model="payment.expiry"                     \
              payments-validate="expiry"                    \
              payments-format="expiry" />                   \
        <label for="">Name on card </label>                 \
        <input type="text"                                  \
            name="name"                                     \
            ng-model="payment.name" />                      \
        <label for="">CVC</label>                           \
        <input type="text"                                  \
            name="cvc"                                      \
            ng-model="payment.cvc"                          \
            payments-validate="cvc"                         \
            payments-format="cvc"                           \
            payments-type-model="type"/>                    \
        <label for="zip">Zipcode</label>                    \
        <input type="text"                                  \
          name="addressZip"                                 \
          ng-model="payment.addressZip"/>                     \
        <input type="hidden"                                \
          ng-model="payment.account_code"                   \
          name="account_code">                              \
        <input type="hidden"                                \
          ng-model="payment.plan_code"                      \
          name="plan_code" ng-value="basic">                \
        <input type="hidden"                                \
          ng-model="payment.quantity"                       \
          name="quantity" ng-value="1">                     \
        <button type="submit">Submit</button>               \
        </form>';
    elm = angular.element(tpl);

    win.recurly = recurlyMock;
    scope.payment = {
      number: null, expiry: null, name: null,
    };
    scope.handleRecurly = handleRecurly;
    $compile(elm)(scope);
    scope.$digest();
    form = scope.myForm;
  }));

  describe('FormDataMiner', function() {
    var formDataMiner;

    beforeEach(inject(function(FormDataMiner) {
      formDataMiner = FormDataMiner;
    }));

    it('should be able to find number value set in a form', function() {
      fillInForm({
        number: '4111111111111111', cvc: '123'
      });
      scope.$digest();
      var data = formDataMiner.mine(form);
      expect(data.number).toEqual('4111111111111111');
      expect(data.cvc).toEqual('123');
      expect(data.addressZip).not.toBeDefined();
    });

    it('should be able to find extra values', function() {
      fillInForm({number: '4111111111111111', quantity: 3});
      var data = formDataMiner.mine(form, {}, ['quantity']);
      expect(data.number).toEqual('4111111111111111');
      expect(data.quantity).toEqual(3);
    });

    it('should pull expiry month from expiry fields', function() {
      fillInForm({number: '4111111111111111'});
      var data = formDataMiner.mine(form, {expMonth: '4', expYear: '2015'}, ['quantity']);
      expect(data.number).toEqual('4111111111111111');
      expect(data.exp_month).toEqual('4');
      expect(data.exp_year).toEqual('2015');
    });
  }); // end FormDataMiner

  describe('submission', function() {
    var btn;
    beforeEach(function() {
      btn = elm.find('button')[0];
    });

    it('should disable the submit button regardless of state of form', function() {
      fillInForm({
        number: '4111111111111111'
      });
      btn.click();
      scope.$digest();
      expect(btn.disabled).toBeTruthy();
    });

    describe('useStoredBillingInfo', function() {
      var newForm;
      beforeEach(inject(function($compile) {
        var tpl = elm;
        elm.attr('use-stored-billing-info', 'useStored');
        $compile(tpl)(scope);
        newForm = scope.myForm;
        btn = tpl.find('button')[0];
      }));

      it('should call through to the submit function', function() {
        spyOn(scope, 'handleRecurly');
        scope.useStored = true;
        fillInForm({number: '4111111111111111'}, newForm);
        btn.click();
        scope.$digest();
        expect(scope.handleRecurly).toHaveBeenCalled();
      });

    });


  });

});