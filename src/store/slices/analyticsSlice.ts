import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AnalyticsState } from "../../types";

const API_BASE_URL = "api";

export const fetchAnalytics = createAsyncThunk(
  "analytics/fetchAnalytics",
  async (timeRange: string, { getState }) => {
    const state = getState() as any;
    const token = state.auth.token;

    const response = await fetch(`${API_BASE_URL}/analytics`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // console.log(await response.json());

    if (!response.ok) {
      throw new Error("Failed to fetch analytics");
    }

    return response.json();
  }
);

// export const fetchAnalytics = createAsyncThunk(
//   "analytics/fetchAnalytics",
//   async ({ getState }) => {
//     const state = getState() as any;
//     const token = state.auth.token;

//     const res = await fetch("/api/analytics", {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     if (!res.ok) throw new Error(await res.text());
//     return await res.json();
//   }
// );

const initialState: AnalyticsState = {
  data: null,
  isLoading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    clearAnalytics: (state) => {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch analytics";
      });
  },
});

export const { clearAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;
