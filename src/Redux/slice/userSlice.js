import { createSlice } from '@reduxjs/toolkit';
import { getAdminMe } from '../Controller/crudUser';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    userInfo: {},
    isLoading:false,
    error:null,
    isAuthenticated:false
  },
  reducers: {
    setUserinfo: (state, action) => {
      state.userInfo = action.payload;
    },
    clearUserinfo: (state) => {
      state.userInfo = {};
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase('auth/logout/fulfilled', (state) => {
        state.userInfo = {};
      })
      .addCase(getAdminMe.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAdminMe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.userInfo = action.payload; // Sets the admin user data
      })
      .addCase(getAdminMe.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.userInfo = null;
        state.error = action.payload; // Captures "Access denied. Administrator privileges required."
      })
  }
});

export const { setUserinfo, clearUserinfo } = userSlice.actions;
export default userSlice.reducer;