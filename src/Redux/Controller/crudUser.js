
import {createAsyncThunk} from "@reduxjs/toolkit"
import authApi from "../../config/authApi";


export const getAdminMe = createAsyncThunk('auth/getAdminMe', async (_, thunkAPI) => {
  try {
    const response = await authApi.get('/users/admin/me');
    
    // Explicitly check for the success: false flag
    if (response.data.success === false) {
      return thunkAPI.rejectWithValue(response.data.error || "Not authenticated as admin");
    }
    
    return response.data.user;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.error || "Server error");
  }
});