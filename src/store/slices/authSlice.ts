import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, User } from "../../types";

const API_BASE_URL = "/api";

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    return response.json();
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async ({
    email,
    password,
    name,
  }: {
    email: string;
    password: string;
    name: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      throw new Error("Registration failed");
    }

    return response.json();
  }
);

export const verifyToken = createAsyncThunk(
  "auth/verifyToken",
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as any;
    const token = state.auth.token || localStorage.getItem("token");
    if (!token) return rejectWithValue("No token");
    const res = await fetch(`${API_BASE_URL}/auth/verifyToken`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      return rejectWithValue(await res.text());
    }
    const data = await res.json(); // { user: {...} }
    return data.user as User;
  }
);
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token"),
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // login/register as you already have...
      .addCase(loginUser.pending, (s) => {
        s.isLoading = true;
        s.error = null;
      })
      .addCase(loginUser.fulfilled, (s, a) => {
        s.isLoading = false;
        s.user = a.payload.user;
        s.token = a.payload.token;
        localStorage.setItem("token", a.payload.token);
      })
      .addCase(loginUser.rejected, (s, a) => {
        s.isLoading = false;
        s.error = a.error.message || "Login failed";
      })
      .addCase(registerUser.pending, (s) => {
        s.isLoading = true;
        s.error = null;
      })
      .addCase(registerUser.fulfilled, (s, a) => {
        s.isLoading = false;
        s.user = a.payload.user;
        s.token = a.payload.token;
        localStorage.setItem("token", a.payload.token);
      })
      .addCase(registerUser.rejected, (s, a) => {
        s.isLoading = false;
        s.error = a.error.message || "Registration failed";
      })

      // NEW: verifyToken lifecycle
      .addCase(verifyToken.pending, (s) => {
        s.isLoading = true;
      })
      .addCase(verifyToken.fulfilled, (s, a) => {
        s.isLoading = false;
        s.user = a.payload;
        // keep existing token from storage/state
      })
      .addCase(verifyToken.rejected, (s) => {
        s.isLoading = false;
        // optional hard-logout on invalid token:
        // s.user = null; s.token = null; localStorage.removeItem("token");
      });
  },
});

export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
