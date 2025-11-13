// Validate email
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate wallet address
export const validateWalletAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Validate product form
export const validateProductForm = (formData) => {
  const errors = {};

  if (!formData.productName?.trim()) {
    errors.productName = 'Product name is required';
  }

  if (!formData.description?.trim()) {
    errors.description = 'Description is required';
  }

  if (!formData.category) {
    errors.category = 'Category is required';
  }

  if (!formData.batchNumber?.trim()) {
    errors.batchNumber = 'Batch number is required';
  }

  if (!formData.quantity || formData.quantity <= 0) {
    errors.quantity = 'Valid quantity is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Validate shipment form
export const validateShipmentForm = (formData) => {
  const errors = {};

  if (!formData.productId) {
    errors.productId = 'Product is required';
  }

  if (!formData.to?.trim()) {
    errors.to = 'Recipient address is required';
  } else if (!validateWalletAddress(formData.to)) {
    errors.to = 'Invalid wallet address';
  }

  if (!formData.expectedArrival) {
    errors.expectedArrival = 'Expected arrival is required';
  } else {
    const arrival = new Date(formData.expectedArrival);
    if (arrival <= new Date()) {
      errors.expectedArrival = 'Expected arrival must be in the future';
    }
  }

  if (!formData.trackingNumber?.trim()) {
    errors.trackingNumber = 'Tracking number is required';
  }

  if (!formData.vehicleInfo?.trim()) {
    errors.vehicleInfo = 'Vehicle information is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Validate checkpoint form
export const validateCheckpointForm = (formData) => {
  const errors = {};

  if (!formData.location?.trim()) {
    errors.location = 'Location is required';
  }

  if (!formData.latitude) {
    errors.latitude = 'Latitude is required';
  }

  if (!formData.longitude) {
    errors.longitude = 'Longitude is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Validate registration form
export const validateRegistrationForm = (formData) => {
  const errors = {};

  if (!formData.name?.trim()) {
    errors.name = 'Name is required';
  }

  if (!formData.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Invalid email address';
  }

  if (!formData.role || formData.role === 0) {
    errors.role = 'Role is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};