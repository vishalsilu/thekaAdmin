import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';

export const fetchSiteData = createAsyncThunk(
  'siteData/fetch',
  async (_, thunkAPI) => {
    try {
      const { data } = await api.get('/site');
      return data.siteData;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error || 'Failed to load site data');
    }
  }
);

export const updateSiteData = createAsyncThunk(
  'siteData/update',
  async (siteDataPayload, thunkAPI) => {
    try {
        const { data } = await api.patch('/site', siteDataPayload);
        if (data && data.siteData) return data.siteData;
        // If server responded but didn't include siteData, treat as OTP pending
        return { pending: true, message: data?.message || 'OTP required to confirm this update' };
    } catch (error) {
      console.error('Admin: UPDATE ERROR:', error.response?.data);
      return thunkAPI.rejectWithValue(error.response?.data?.error || 'Failed to save site data');
    }
  }
);
