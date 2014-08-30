angular.module('angularPayments', [])

// Cart types accepted
.value('angularPaymentsOptions', {
  enabledCardTypes: ['amex', 'dinersclub', 'discover', 'jcb', 'maestro', 'mastercard', 'unionpay', 'visa']
})
