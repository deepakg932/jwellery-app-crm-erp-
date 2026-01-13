// services/stockInService.js
import axios from 'axios';

export const stockInAPI = {
  // Create GRN
  createGRN: async (grnData) => {
    try {
      const response = await axios.post('/api/stock-in/create', grnData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  // Get GRN list
  getGRNList: async (params = {}) => {
    try {
      const response = await axios.get('/api/stock-in', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  // Get single GRN
  getGRNById: async (id) => {
    try {
      const response = await axios.get(`/api/stock-in/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};