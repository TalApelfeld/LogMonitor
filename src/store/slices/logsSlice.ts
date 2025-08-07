import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { LogState, LogEntry } from "../../types";

const API_BASE_URL = "api";

export const fetchLogs = createAsyncThunk(
  "logs/fetchLogs",
  async (_, { getState }) => {
    const state = getState() as any;
    const token = state.auth.token;

    const response = await fetch(`${API_BASE_URL}/logs`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch logs");
    }

    // console.log("Fetched logs:", await response.json());
    return response.json();
  }
);

// export const searchLogs = createAsyncThunk(
//   "logs/searchLogs",
//   async (searchParams: Record<string, any>, { getState }) => {
//     const state = getState() as any;
//     const token = state.auth.token;

//     const queryString = new URLSearchParams(searchParams).toString();
//     const response = await fetch(`${API_BASE_URL}/logs/search?${queryString}`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     if (!response.ok) {
//       throw new Error("Failed to search logs");
//     }

//     return response.json();
//   }
// );

export const searchLogs = createAsyncThunk(
  "logs/searchLogs",
  async (
    {
      q,
      level,
      service,
      from,
      to,
    }: {
      q?: string;
      level?: string;
      service?: string;
      from?: string;
      to?: string;
    },
    { getState }
  ) => {
    const state = getState() as any;
    const token = state.auth.token;

    const params = new URLSearchParams();
    if (q) params.append("q", q);
    if (level) params.append("level", level);
    if (service) params.append("service", service);
    if (from) params.append("from", from);
    if (to) params.append("to", to);

    const response = await fetch(`/api/logs/search?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error(await response.text());
    return (await response.json()) as any[];
  }
);

const initialState: LogState = {
  logs: [],
  filteredLogs: [],
  isLoading: false,
  error: null,
  filters: {
    level: "",
    service: "",
    timeRange: "1h",
    search: "",
  },
};

const logsSlice = createSlice({
  name: "logs",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<typeof initialState.filters>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    addLog: (state, action: PayloadAction<LogEntry>) => {
      state.logs.unshift(action.payload);
      if (state.logs.length > 1000) {
        state.logs = state.logs.slice(0, 1000);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.logs = action.payload;
        state.filteredLogs = action.payload;
      })
      .addCase(fetchLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch logs";
      })
      .addCase(searchLogs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(searchLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.filteredLogs = action.payload;
      })
      .addCase(searchLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Search failed";
      });
  },
});

export const { setFilters, clearFilters, addLog } = logsSlice.actions;
export default logsSlice.reducer;
