'use client';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface User {
  username?: string;
  displayName?: string;
  name?: string;
  email: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

// Utilities
const setAuthStorage = (user: User, token: string) => {
  localStorage.setItem('taskly_user', JSON.stringify(user));
  localStorage.setItem('taskly_token', token);
};

const clearAuthStorage = () => {
  localStorage.removeItem('taskly_user');
  localStorage.removeItem('taskly_token');
};

// Register
export const registerUser = createAsyncThunk(
  'auth/register',
  async (
    userData: { username: string; email: string; password: string },
    thunkAPI
  ) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (!response.ok) {
        return thunkAPI.rejectWithValue(data.message || 'Registration failed');
      }

      setAuthStorage(data.user, data.token);
      return data.user;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
    }
  }
);

// Login
export const loginUser = createAsyncThunk(
  'auth/login',
  async (
    credentials: { email: string; password: string },
    thunkAPI
  ) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      setAuthStorage(data.user, data.token);
      return data.user;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
    }
  }
);

// Google Login
export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (_, thunkAPI) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const token = await user.getIdToken();

      const payload: User = {
        email: user.email!,
        displayName: user.displayName!,
        name: user.displayName!,
      };

      setAuthStorage(payload, token);
      return payload;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: { payload: User }) => {
      state.user = action.payload;
    },
    
    logout: (state) => {
      state.user = null;
      clearAuthStorage();
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Register
    builder.addCase(registerUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Google Login
    builder.addCase(googleLogin.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(googleLogin.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
    });
    builder.addCase(googleLogin.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;
