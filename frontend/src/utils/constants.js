// Smart contract address
export const CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890'; // Replace with actual contract address

// Disaster types
export const DISASTER_TYPES = [
  'Earthquake', 'Flood', 'Hurricane', 'Wildfire',
    'Tornado', 'Tsunami', 'Drought', 'Volcanic Eruption',
    'Landslide', 'Pandemic', 'Conflict', 'Other'
];

// Severity levels
export const SEVERITY_LEVELS = [
  'Low',
  'Medium',
  'High',
  'Critical'
];

// Sort options
export const SORT_OPTIONS = [
  { value: 'nameAsc', label: 'Name (A-Z)' },
  { value: 'nameDesc', label: 'Name (Z-A)' },
  { value: 'progressDesc', label: 'Highest Funding Progress' },
  { value: 'progressAsc', label: 'Lowest Funding Progress' },
  { value: 'severityHigh', label: 'Highest Severity First' },
  { value: 'severityLow', label: 'Lowest Severity First' },
  { value: 'targetAmountDesc', label: 'Highest Target Amount' },
  { value: 'targetAmountAsc', label: 'Lowest Target Amount' }
];

// Severity color mapping
export const SEVERITY_COLORS = {
  'Low': 'bg-blue-600',
  'Medium': 'bg-yellow-500',
  'High': 'bg-orange-500',
  'Critical': 'bg-red-600'
};

// Disaster type icons (map to imported icons later)
export const TYPE_ICONS = {
  'Earthquake': 'earthquake',
  'Flood': 'flood',
  'Hurricane': 'hurricane',
  'Tsunami': 'tsunami',
  'Wildfire': 'fire',
  'Drought': 'drought',
  'Pandemic': 'pandemic',
  'Conflict': 'conflict',
  'Other': 'other'
};