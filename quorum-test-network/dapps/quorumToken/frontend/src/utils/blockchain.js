// src/utils/blockchain.js
import { ethers } from 'ethers';

/**
 * Format ETH value for display
 * @param {string|number} wei - Value in wei
 * @returns {string} Formatted ETH value
 */
export const formatEthValue = (wei) => {
  try {
    return parseFloat(ethers.formatEther(wei)).toFixed(4) + ' ETH';
  } catch (error) {
    console.error('Error formatting ETH value:', error);
    return '0.0000 ETH';
  }
};

/**
 * Shorten Ethereum address for display
 * @param {string} address - Full Ethereum address
 * @param {number} startChars - Number of characters to show at start
 * @param {number} endChars - Number of characters to show at end
 * @returns {string} Shortened address
 */
export const shortenAddress = (address, startChars = 6, endChars = 4) => {
  if (!address || address.length < startChars + endChars) {
    return address;
  }
  return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
};

/**
 * Validate Ethereum address
 * @param {string} address - Ethereum address to validate
 * @returns {boolean} True if valid address
 */
export const isValidAddress = (address) => {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
};

/**
 * Convert date to human readable format
 * @param {number|string} timestamp - Unix timestamp
 * @returns {string} Formatted date
 */
export const formatDate = (timestamp) => {
  try {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Data inválida';
  }
};

export default {
  formatEthValue,
  shortenAddress,
  isValidAddress,
  formatDate
};