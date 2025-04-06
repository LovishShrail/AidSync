export const validateEthereumAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };
  
  export const validateDonationAmount = (amount) => {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0;
  };
  
  export const validateDisasterForm = (formData) => {
    const errors = {};
    
    if (!formData.disasterName.trim()) {
      errors.disasterName = 'Disaster name is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!formData.affectedAreas.trim()) {
      errors.affectedAreas = 'Affected areas are required';
    }
    
    if (!formData.affectedPeopleCount || formData.affectedPeopleCount <= 0) {
      errors.affectedPeopleCount = 'Must affect at least 1 person';
    }
    
    if (!formData.targetCollectionAmount || formData.targetCollectionAmount <= 0) {
      errors.targetCollectionAmount = 'Target amount must be positive';
    }
    
    if (!formData.reliefOrganizations.length) {
      errors.reliefOrganizations = 'At least one organization must be selected';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };