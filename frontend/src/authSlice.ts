import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface AuthState {
  user: null | { email: string };
  loading: boolean;
  error: string | null;
  formErrors: { email?: string; password?: string };
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  formErrors: {},
};

export const login = createAsyncThunk(
  'auth/login',
  async (data: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', data);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (data: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://localhost:3000/api/auth/register', data);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      localStorage.removeItem('auth');
      localStorage.removeItem('token');
    },
    clearError(state) {
      state.error = null;
    },
    setFormErrors(state, action: PayloadAction<{ email?: string; password?: string }>) {
      state.formErrors = action.payload;
    },
    clearFormErrors(state) {
      state.formErrors = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { email: action.payload.email };
        localStorage.setItem('auth', 'true');
        if (action.payload.token) {
          localStorage.setItem('token', action.payload.token);
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { email: action.payload.email };
        localStorage.setItem('auth', 'true');
        if (action.payload.token) {
          localStorage.setItem('token', action.payload.token);
        }
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError, setFormErrors, clearFormErrors } = authSlice.actions;
export default authSlice; 