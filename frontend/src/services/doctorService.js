import api from '../config/api';

export const doctorService = {
  getAllDoctors: async () => {
    try {
      const response = await api.get('/doctors');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch doctors' };
    }
  },

  getDoctor: async (id) => {
    try {
      const response = await api.get(`/doctors/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch doctor' };
    }
  },

  createDoctor: async (doctorData) => {
    try {
      const response = await api.post('/doctors', doctorData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to create doctor' };
    }
  },

  updateDoctor: async (id, doctorData) => {
    try {
      const response = await api.put(`/doctors/${id}`, doctorData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to update doctor' };
    }
  },

  deleteDoctor: async (id) => {
    try {
      const response = await api.delete(`/doctors/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to delete doctor' };
    }
  },

  deleteAllDoctors: async () => {
    try {
      const response = await api.delete('/doctors/reset/all');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to delete doctors' };
    }
  },
};
