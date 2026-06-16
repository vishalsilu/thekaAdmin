import { createSlice } from '@reduxjs/toolkit';
import { fetchSiteData, updateSiteData } from '../thunks/siteDataThunks';

const siteDataSlice = createSlice({
  name: 'siteData',
  initialState: {
    data: null,
    isLoading: false,
    error: null,
    pending: false,
    pendingMessage: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSiteData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSiteData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload ?? {};
        state.error = null;
      })
      .addCase(fetchSiteData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateSiteData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSiteData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        if (action.payload && action.payload.pending) {
          state.pending = true;
          state.pendingMessage = action.payload.message || '';
        } else {
          state.pending = false;
          state.pendingMessage = null;
          state.data = action.payload ?? {};
        }
      })
      .addCase(updateSiteData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default siteDataSlice.reducer;
