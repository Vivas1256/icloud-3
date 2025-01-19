export default {
  formId: 'checkoutForm',
  formField: {
    firstName: {
      name: 'firstName',
      label: 'Nombres*',
      requiredErrorMsg: 'Nombre es obligatorio'
    },
    lastName: {
      name: 'lastName',
      label: 'Apellidos*',
      requiredErrorMsg: 'Apellido es requerido'
    },
    address1: {
      name: 'address2',
      label: 'Direccion*',
      requiredErrorMsg: 'La direccion es obligatoria'
    },

    city: {
      name: 'city',
      label: 'Ciudad*',
      requiredErrorMsg: 'Ciudad es obligatoria'
    },
    state: {
      name: 'state',
      label: 'Estado*',
      requiredErrorMsg: 'Estado/Departamento es obligatoria'
    },
    zipcode: {
      name: 'zipcode',
      label: 'Codigo postal',
      requiredErrorMsg: 'Codigo postal obligatorio',
      invalidErrorMsg: 'Formato de Codigo postal inválido'
    },
    country: {
      name: 'country',
      label: 'País*',
      requiredErrorMsg: 'País es Obligatorio'
    },
    useAddressForPaymentDetails: {
      name: 'useAddressForPaymentDetails',
      label: 'Utilice esta dirección para los detalles del pago'
    },
    invoiceId: {
      name: 'invoiceId',
      label: 'Utilice este ID de factura'
    },
    nameOnCard: {
      name: 'nameOnCard',
      label: 'Name on card*',
      requiredErrorMsg: 'Name on card is required'
    },
    cardNumber: {
      name: 'cardNumber',
      label: 'Card number*',
      requiredErrorMsg: 'Card number is required',
      invalidErrorMsg: 'Card number is not valid (e.g. 4111111111111)'
    },
    expiryDate: {
      name: 'expiryDate',
      label: 'Expiry date*',
      requiredErrorMsg: 'Expiry date is required',
      invalidErrorMsg: 'Expiry date is not valid'
    },
    cvv: {
      name: 'cvv',
      label: 'CVV*',
      requiredErrorMsg: 'CVV is required',
      invalidErrorMsg: 'CVV is invalid (e.g. 357)'
    }
  }
};
