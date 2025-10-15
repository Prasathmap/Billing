import { createSlice, createAsyncThunk, createAction } from "@reduxjs/toolkit";
import authService from "./authServices";
import { toast } from "react-toastify";

// Check if users exist in local storage
const getAttenderFromLocalStorage = localStorage.getItem("pos")
  ? JSON.parse(localStorage.getItem("pos"))
  : null;

const initialState = {
  attender: getAttenderFromLocalStorage,
  profiles: [],
  isError: false,
  isLoading: false,
  isSuccess: false,
  message: "",
};

// POS Login thunk
export const login = createAsyncThunk(
  "auth/poslogin",
  async (userData, thunkAPI) => {
    try {
      return await authService.login(userData);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Profiles thunk (same as before)
export const getProfiles = createAsyncThunk(
  "auth/get-profiles",
  async (_, thunkAPI) => {
    try {
      return await authService.getProfiles();
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const resetState = createAction("Reset_all");

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // POS login cases
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.attender = action.payload;
        localStorage.setItem("pos", JSON.stringify(action.payload));
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload?.message || "POS login failed";
        toast.error(state.message);
      })

      // Profiles cases
      .addCase(getProfiles.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProfiles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.profiles = action.payload;
      })
      .addCase(getProfiles.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload?.message || "Failed to fetch profiles";
      })

      // Reset state
      .addCase(resetState, () => initialState);
  },
});

export default authSlice.reducer;
