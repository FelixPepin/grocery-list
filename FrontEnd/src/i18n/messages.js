/**
 * Every text of the interface, in English and French.
 * Error keys match the `code` returned by the API, so server errors can be translated.
 */
export const messages = {
  en: {
    app: {
      title: 'Grocery List',
    },
    list: {
      loading: 'Loading your list…',
      empty: 'Your list is empty. Add your first item!',
      quantity: 'Qty',
      unitPrice: 'Unit price',
      subtotal: 'Subtotal',
    },
    errors: {
      NETWORK_ERROR: 'Unable to reach the server. Is the backend running?',
      INTERNAL_ERROR: 'Something went wrong. Please try again later.',
      NAME_REQUIRED: 'Name is required.',
      NAME_INVALID: 'Name must be text.',
      NAME_EMPTY: 'Name cannot be empty.',
      NAME_TOO_LONG: 'Name cannot exceed {max} characters.',
      QUANTITY_REQUIRED: 'Quantity is required.',
      QUANTITY_INVALID: 'Quantity must be a whole number.',
      QUANTITY_TOO_LOW: 'Quantity must be at least 1.',
      UNIT_PRICE_REQUIRED: 'Unit price is required.',
      UNIT_PRICE_INVALID: 'Unit price must be a number.',
      UNIT_PRICE_TOO_LOW: 'Unit price must be greater than 0.',
      ITEM_NOT_FOUND: 'This item no longer exists.',
      QUANTITY_TOO_HIGH: 'Quantity cannot exceed {max}.',
      UNIT_PRICE_TOO_HIGH: 'Unit price cannot exceed {max} $.',
    },
    form: {
      title: 'Add an item',
      name: 'Name',
      quantity: 'Quantity',
      unitPrice: 'Unit price',
      submit: 'Add',
      submitting: 'Adding…',
      success: '{name} was added to your list.',
    },
  },
  fr: {
    app: {
      title: "Liste d'épicerie",
    },
    list: {
      loading: 'Chargement de votre liste…',
      empty: 'Votre liste est vide. Ajoutez votre premier article!',
      quantity: 'Qté',
      unitPrice: 'Prix unitaire',
      subtotal: 'Sous-total',
    },
    errors: {
      NETWORK_ERROR: 'Impossible de joindre le serveur. Le backend est-il démarré?',
      INTERNAL_ERROR: 'Une erreur est survenue. Veuillez réessayer plus tard.',
      NAME_REQUIRED: 'Le nom est requis.',
      NAME_INVALID: 'Le nom doit être du texte.',
      NAME_EMPTY: 'Le nom ne peut pas être vide.',
      NAME_TOO_LONG: 'Le nom ne peut pas dépasser {max} caractères.',
      QUANTITY_REQUIRED: 'La quantité est requise.',
      QUANTITY_INVALID: 'La quantité doit être un nombre entier.',
      QUANTITY_TOO_LOW: 'La quantité doit être d’au moins 1.',
      UNIT_PRICE_REQUIRED: 'Le prix unitaire est requis.',
      UNIT_PRICE_INVALID: 'Le prix unitaire doit être un nombre.',
      UNIT_PRICE_TOO_LOW: 'Le prix unitaire doit être supérieur à 0.',
      ITEM_NOT_FOUND: "Cet article n'existe plus.",
      QUANTITY_TOO_HIGH: 'La quantité ne peut pas dépasser {max}.',
      UNIT_PRICE_TOO_HIGH: 'Le prix unitaire ne peut pas dépasser {max} $.',
    },
    form: {
      title: 'Ajouter un article',
      name: 'Nom',
      quantity: 'Quantité',
      unitPrice: 'Prix à l’unité',
      submit: 'Ajouter',
      submitting: 'Ajout…',
      success: '{name} a été ajouté à votre liste.',
    },
  },
}
