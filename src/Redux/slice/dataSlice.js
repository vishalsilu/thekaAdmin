import { createSlice } from '@reduxjs/toolkit';
import { getProducts } from '../Controller/Product';
import { createProduct, updateProduct } from '../Controller/Product';
import { getCollections, createCollection, updateCollection, deleteCollection } from '../Controller/Collection';
import { getAllCategories, getcategories, createCategory, updateCategory, deleteCategory } from '../Controller/Category';

const initialState = {
  products: [],
  collections:[],
  categories: [],
  allCategories: [],
  loading: false,
  error: null,
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
   
  },
    extraReducers: (builder) => {
        builder
            .addCase(getProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.products = action.payload; // Assuming payload is the products array
            })
            .addCase(getProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch products';
            })
            .addCase(getCollections.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCollections.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.collections = action.payload; // Assuming payload is the collections array
            })
            .addCase(getCollections.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch collections';
            })
            .addCase(createCollection.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createCollection.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                if (action.payload && action.payload.data) state.collections.unshift(action.payload.data);
            })
            .addCase(createCollection.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to create collection';
            })
            .addCase(updateCollection.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCollection.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                if (action.payload && action.payload.data) {
                    const updated = action.payload.data;
                    const idx = state.collections.findIndex(c => c._id === updated._id || c.id === updated.id);
                    if (idx !== -1) state.collections[idx] = updated;
                }
            })
            .addCase(updateCollection.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to update collection';
            })
            .addCase(deleteCollection.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteCollection.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.collections = state.collections.filter(c => c._id !== action.payload.id && c.id !== action.payload.id);
            })
            .addCase(deleteCollection.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to delete collection';
            })
            .addCase(getcategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getcategories.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.categories = action.payload; // Assuming payload is the categories array
            })
            .addCase(getcategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch categories';
            })
            .addCase(getAllCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.allCategories = action.payload; // Assuming payload is the categories array
            })
            .addCase(getAllCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch categories';
            })
            // Create Category
            .addCase(createCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                if (action.payload && action.payload.data) state.allCategories.unshift(action.payload.data);
            })
            .addCase(createCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to create category';
            })
            // Update Category
            .addCase(updateCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                if (action.payload && action.payload.data) {
                    const updated = action.payload.data;
                    const idx = state.allCategories.findIndex(c => c._id === updated._id || c.id === updated.id);
                    if (idx !== -1) state.allCategories[idx] = updated;
                }
            })
            .addCase(updateCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to update category';
            })
            // Delete Category
            .addCase(deleteCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.allCategories = state.allCategories.filter(c => c._id !== action.payload.id && c.id !== action.payload.id);
            })
            .addCase(deleteCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to delete category';
            })
            // Create Product
            .addCase(createProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                if (action.payload && action.payload.data) state.products.unshift(action.payload.data);
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to create product';
            })
            // Update Product
            .addCase(updateProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                if (action.payload && action.payload.data) {
                    const updated = action.payload.data;
                    const idx = state.products.findIndex(p => p._id === updated._id || p.id === updated.id);
                    if (idx !== -1) state.products[idx] = updated;
                }
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to update product';
            })
                
    }
});

export const {  } = dataSlice.actions;
export default dataSlice.reducer;
