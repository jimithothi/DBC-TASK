import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from './axiosInstance';

export interface Product {
  _id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  category: string;
  image: string;
}

interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
}

const initialProductsState: ProductsState = {
  products: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  totalPages: 1,
};

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params: { page?: number; limit?: number; name?: string; category?: string; stockStatus?: string } = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const query = new URLSearchParams();
      if (params.page) query.append('page', String(params.page));
      if (params.limit) query.append('limit', String(params.limit));
      if (params.name) query.append('name', params.name);
      if (params.category) query.append('category', params.category);
      if (params.stockStatus) query.append('stockStatus', params.stockStatus);
      const response = await axiosInstance.get(`http://localhost:3000/api/products?${query.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Expecting response.data to have: products, total, page, totalPages
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (data: { product: Omit<Product, '_id' | 'image'>; imageFile?: File }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      Object.entries(data.product).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      if (data.imageFile) {
        formData.append('image', data.imageFile);
      }
      const response = await axiosInstance.post('http://localhost:3000/api/products', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async (data: { product: Product; imageFile?: File }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      Object.entries(data.product).forEach(([key, value]) => {
        if (key !== 'id') formData.append(key, value as string);
      });
      if (data.imageFile) {
        formData.append('image', data.imageFile);
      }
      const response = await axiosInstance.put(`http://localhost:3000/api/products/${data.product._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.delete(`http://localhost:3000/api/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete product');
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState: initialProductsState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products || [];
        state.total = action.payload.total || 0;
        state.page = action.payload.page || 1;
        state.totalPages = action.payload.totalPages || 1;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.push(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const idx = state.products.findIndex(p => p._id === action.payload._id);
        if (idx !== -1) state.products[idx] = action.payload;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(p => p._id !== action.payload);
      });
  },
});

export default productsSlice; 