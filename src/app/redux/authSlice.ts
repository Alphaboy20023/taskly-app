'use client';

import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// ---------- Types ----------
interface User {
  avatar: string | Blob | undefined;
  id: string;
  email: string;
  username?: string;
  name?: string;
  authMethod: 'local' | 'google';
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

// ---------- Utilities ----------
const setAuthStorage = (user: User, token?: string) => {
  localStorage.setItem('taskly_user', JSON.stringify(user));
  if (token) localStorage.setItem('taskly_token', token);
};

const clearAuthStorage = () => {
  localStorage.removeItem('taskly_user');
  localStorage.removeItem('taskly_token');
};

// ---------- Thunks ----------

// 1. Google Login
export const googleLogin = createAsyncThunk<User, void, { rejectValue: string }>(
  'auth/googleLogin',
  async (_, thunkAPI) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      const email = result.user.email;
      const name = result.user.displayName;

      if (!email) throw new Error('No email from Google');

      const res = await fetch('/api/auth/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, name }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Google login failed');
      }

      const { user } = await res.json();
      setAuthStorage(user, token);
      return user;

    } catch (err) {
      await auth.signOut();
      return thunkAPI.rejectWithValue(
        err instanceof Error ? err.message : 'Google login failed'
      );
    }
  }
);

// 2. Local Login
export const loginUser = createAsyncThunk<User, { email: string; password: string }, { rejectValue: string }>(
  'auth/login',
  async (credentials, thunkAPI) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        const data = await res.json();
        return thunkAPI.rejectWithValue(data.error || 'Login failed');
      }

      const { user, token } = await res.json();

      if (user.authMethod !== 'local') {
        return thunkAPI.rejectWithValue(`Please login using ${user.authMethod}`);
      }

      setAuthStorage(user, token);
      return user;

    } catch (err) {
      return thunkAPI.rejectWithValue(
        err instanceof Error ? err.message : 'Login failed'
      );
    }
  }
);

// 3. Local Register
export const registerUser = createAsyncThunk<User, { username: string; email: string; password: string }, { rejectValue: string }>(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!res.ok) {
        const text = await res.text();
        return thunkAPI.rejectWithValue(text || 'Registration failed');
      }

      const { user, token } = await res.json();
      setAuthStorage(user, token);
      return user;

    } catch (err) {
      return thunkAPI.rejectWithValue(
        err instanceof Error ? err.message : 'Registration failed'
      );
    }
  }
);

// ---------- Slice ----------
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      clearAuthStorage();
      auth.signOut();
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload;
      })
      .addCase(googleLogin.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || 'Google login failed';
      })

      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload;
      })
      .addCase(loginUser.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || 'Login failed';
      })

      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload;
      })
      .addCase(registerUser.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || 'Registration failed';
      });
  }
});

// ---------- Exports ----------
export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;
