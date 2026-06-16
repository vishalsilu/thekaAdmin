import {createAsyncThunk} from '@reduxjs/toolkit';
import api from "../../config/api";

export const getCollections = createAsyncThunk('collections/getAll', async (_, thunkAPI) => {
    try {
        const response = await api.get('/collections');
        return response.data.collections || response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.error || "Failed to fetch collections");
    }
});

const buildCollectionFormData = (collectionData) => {
    const formData = new FormData();
    Object.entries(collectionData).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        if (key === 'imageFile') {
            formData.append('image', value);
            return;
        }

        if (key === 'featured') {
            formData.append('featured', JSON.stringify(value));
            return;
        }

        if (typeof value === 'boolean') {
            formData.append(key, String(value));
            return;
        }

        formData.append(key, value);
    });
    return formData;
};

export const createCollection = createAsyncThunk('collections/create', async (collectionData, thunkAPI) => {
    try {
        const payload = collectionData.imageFile || collectionData.removeImage
            ? buildCollectionFormData(collectionData)
            : collectionData;

        const response = await api.post('/collections', payload);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.error || "Failed to create collection");
    }
});

export const updateCollection = createAsyncThunk('collections/update', async ({ id, collectionData }, thunkAPI) => {
    try {
        const payload = collectionData.imageFile || collectionData.removeImage
            ? buildCollectionFormData(collectionData)
            : collectionData;

        const response = await api.put(`/collections/${id}`, payload);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.error || "Failed to update collection");
    }
});

export const deleteCollection = createAsyncThunk('collections/delete', async (collectionId, thunkAPI) => {
    try {
        const response = await api.delete(`/collections/${collectionId}`);
        return { id: collectionId, ...response.data };
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.error || "Failed to delete collection");
    }
});