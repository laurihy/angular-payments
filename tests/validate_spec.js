describe('Validators', function() {

  beforeEach(module('angularPayments'));

  var Validate;
  beforeEach(inject(function(_Validate) {
    Validate = _Validate;
  }));
  
  describe('full_name', function() {

    it('should be valid when the name contains a space', function() {
      expect(Validate('full_name', 'Ari Lerner')).toBeTruthy();
    });

    it('should be invalid when the name does not contain a space', function() {
      expect(Validate('full_name', 'Ari')).toBeFalsy();
    });

  });

});