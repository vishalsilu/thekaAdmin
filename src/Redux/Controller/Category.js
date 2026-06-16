import {createAsyncThunk} from '@reduxjs/toolkit';
import api from "../../config/api";

export const getcategories = createAsyncThunk('categories/getSingle', async (userData, thunkAPI) => {
    try {
        const response = await api.get(`/category/${userData}`)
        // return response.data;
        return response.data;
    }
    catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.error || "Failed to fetch categories");
    }
});
export const getAllCategories = createAsyncThunk('categories/getAll', async (userData, thunkAPI) => {
    try {
        const response = await api.get(`/category`)
        return response.data;
    }
    catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.error || "Failed to fetch categories");
    }
});

export const createCategory = createAsyncThunk('categories/create', async (categoryData, thunkAPI) => {
    try {
        const response = await api.post(`/category`, categoryData);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.error || "Failed to create category");
    }
});

export const updateCategory = createAsyncThunk('categories/update', async ({ id, categoryData }, thunkAPI) => {
    try {
        const response = await api.put(`/category/${id}`, categoryData);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.error || "Failed to update category");
    }
});

export const deleteCategory = createAsyncThunk('categories/delete', async (categoryId, thunkAPI) => {
    try {
        const response = await api.delete(`/category/${categoryId}`);
        return { id: categoryId, ...response.data };
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.error || "Failed to delete category");
    }
});