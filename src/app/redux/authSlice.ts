'use client'
// import axios from "axios";
import { auth, googleProvider } from '../lib/firebase'
import { signInWithPopup } from "firebase/auth";
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'


export interface User {
  username?: string;
  displayName?: string;
  name?: string;
  email: string;
}
interface AuthState {
  user: User | null;
  loading: boolean
  error: null | string
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
}

// Register
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: { username: string; email: string; password: string }, thunkAPI) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          password: userData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
         return thunkAPI.rejectWithValue(data.message || 'Registration failed') 
      };
      return data.user;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);


// Login
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, thunkAPI) => {
    try {
      
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })

      if (!res.ok) throw new Error('Login failed')
      const data = await res.json();
      console.log("Login API response:", data);
      return data.user;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message)
    }
  }
)

export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (_, thunkAPI) => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      const idToken = await user.getIdToken()

      const payload = {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        uid: user.uid,
        token: idToken,
      }

      localStorage.setItem('kleistic_user', JSON.stringify(payload))

      return payload
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Google login failed')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null
      localStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        // localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // google-login
      .addCase(googleLogin.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false
        // @ts-ignore
        state.user = action.payload
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { logout, setUser, } = authSlice.actions
export default authSlice.reducer



