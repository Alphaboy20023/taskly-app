import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

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

// Auth Utilities (EXACTLY YOUR VERSION)
const setAuthStorage = (user: User, token?: string) => {
  localStorage.setItem('taskly_user', JSON.stringify(user));
  if (token) localStorage.setItem('taskly_token', token);
};

const clearAuthStorage = () => {
  localStorage.removeItem('taskly_user');
  localStorage.removeItem('taskly_token');
};

// Google Auth (MUST SAVE TO MONGODB - NO OPTIONS)
export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (_, thunkAPI) => {
    try {
      // 1. Firebase Auth
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      if (!result.user.email) throw new Error('No email from Google');

      // 2. REQUIRED MongoDB Save
      const response = await fetch('/api/auth/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          email: result.user.email,
          name: result.user.displayName // If you want to save name
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Google login failed');
      }

      // 3. Return MongoDB user
      const { user } = await response.json();
      setAuthStorage(user, token);
      return user;

    } catch (err) {
      await auth.signOut();
      return thunkAPI.rejectWithValue(
        err instanceof Error ? err.message : 'Google auth failed'
      );
    }
  }
);

// Local Login (PURE MONGODB - YOUR EXACT VERSION)
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, thunkAPI) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const data = await response.json();
         return rejectWithValue(data.error || 'Login failed');
      }

      const { user, token } = await response.json();
      if (user.authMethod !== 'local') {
        throw new Error(`Please login using ${user.authMethod}`);
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

// Local Registration (PURE MONGODB - YOUR EXACT VERSION)
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: { username: string; email: string; password: string }, thunkAPI) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (!response.ok) throw new Error(await response.text());

      const { user, token } = await response.json();
      setAuthStorage(user, token);
      return user;

    } catch (err) {
      return thunkAPI.rejectWithValue(
        err instanceof Error ? err.message : 'Registration failed'
      );
    }
  }
);

// Slice (YOUR EXACT STRUCTURE)
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      clearAuthStorage();
      auth.signOut();
    },
    setUser: (state, action) => {
      state.user = action.payload;
    }
  },
  extraReducers: (builder) => {
    const handleAuth = (action: any) => {
      builder
        .addCase(action.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(action.fulfilled, (state, { payload }) => {
          state.loading = false;
          state.user = payload;
        })
        .addCase(action.rejected, (state, { payload }) => {
          state.loading = false;
          state.error = payload as string;
        });
    };

    handleAuth(googleLogin);
    handleAuth(loginUser);
    handleAuth(registerUser);
  }
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;

function rejectWithValue(arg0: any): any {
  throw new Error('Function not implemented.');
}
