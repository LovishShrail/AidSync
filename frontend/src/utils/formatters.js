import { ethers } from 'ethers';
import { SEVERITY_COLORS } from './constants';

// Format address to shorter version
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

// Format ETH amount with appropriate decimal places (updated for ethers v6)
export const formatEther = (wei, decimals = 4) => {
  if (!wei) return '0';
  try {
    const formatted = parseFloat(ethers.formatEther(wei)).toFixed(decimals);
    return formatted.replace(/\.?0+$/, ''); // Remove trailing zeros
  } catch (error) {
    console.error('Error formatting ether:', error);
    return '0';
  }
};

export const timeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown';
  
    const now = new Date();
    const past = new Date(timestamp);
    const seconds = Math.floor((now - past) / 1000);
  
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} days ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} weeks ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} months ago`;
    const years = Math.floor(days / 365);
    return `${years} years ago`;
  };
  

// Format a number with commas for thousands
export const formatNumber = (number) => {
  if (!number && number !== 0) return '';
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Format percentage
export const formatPercentage = (value, decimals = 1) => {
  if (!value && value !== 0) return '0%';
  return `${parseFloat(value).toFixed(decimals)}%`;
};

// Get severity badge color
export const getSeverityColor = (severity) => {
  return SEVERITY_COLORS[severity] || 'bg-gray-500';
};

// Format date
export const formatDate = (timeAgo) => {
  if (!timeAgo) return '';
  const date = new Date(timeAgo * 1000); // Convert blockchain timestamp to JS date
  return date.toLocaleDateString();
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};