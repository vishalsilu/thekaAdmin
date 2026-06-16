import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    userInfo: {}
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
      });
  }
});

export const { setUserinfo, clearUserinfo } = userSlice.actions;
export default userSlice.reducer;