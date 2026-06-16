import { createAsyncThunk } from '@reduxjs/toolkit';
import api from "../../config/api"


export const getProducts =  createAsyncThunk('products/getAll',async (_, thunkAPI) => {
try {
    const response = await api.get('/product');
    return response.data ;
    
} catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.error || "Profile update failed");
}
})

const safeStringify = (value) => {
    const seen = new WeakSet();
    try {
        return JSON.stringify(value, (key, innerValue) => {
            if (typeof innerValue === 'function') {
                return `[function ${innerValue.name || 'anonymous'}]`;
            }
            if (typeof innerValue === 'object' && innerValue !== null) {
                if (seen.has(innerValue)) return '[Circular]';
                seen.add(innerValue);
            }
            return innerValue;
        }, 2);
    } catch (_) {
        try {
            return String(value);
        } catch (__ ) {
            return 'Unknown error';
        }
    }
};

const extractApiError = (error) => {
    if (!error) return 'Create product failed';
    const payload = error.response?.data || error;
    if (typeof payload === 'string') return payload;
    if (payload?.message && typeof payload.message === 'string') return payload.message;
    if (payload?.error && typeof payload.error === 'string') return payload.error;
    if (payload?.errors && typeof payload.errors === 'object') return safeStringify(payload.errors);
    if (payload?.data && typeof payload.data === 'string') return payload.data;
    if (error.message) return error.message;
    return safeStringify(payload);
};

export const updateProduct = createAsyncThunk('products/update', async ({ id, data }, thunkAPI) => {
   
    try {
        // Pass the raw FormData object directly
        const response = await api.put(`/product/${id}`, data); 
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(extractApiError(error));
    }
});

export const deleteProduct = createAsyncThunk('products/delete', async (id, thunkAPI) => {
    try {
        const response = await api.delete(`/product/${id}`);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(extractApiError(error));
    }
});

// FIX 2: Treat 'formData' as the direct payload instead of an object block wrapper
export const createProduct = createAsyncThunk('products/create', async (formData, thunkAPI) => {
    try {
        // Send raw formData directly so the interceptor catches it as an instanceof FormData
        const response = await api.post('/product', formData);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(extractApiError(error));
    }
});