import { createSlice, createAsyncThunk, createAction } from "@reduxjs/toolkit";
import taxService from "./taxService";

export const getTaxs = createAsyncThunk(
  "tax/get-taxs",
  async (thunkAPI) => {
    try {
      return await taxService.getTaxs();
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);
export const getATax = createAsyncThunk(
  "tax/get-tax",
  async (id, thunkAPI) => {
    try {
      return await taxService.getTax(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);
export const createTax = createAsyncThunk(
  "tax/create-tax",
  async (taxData, thunkAPI) => {
    try {
      return await taxService.createTax(taxData);
    } catch (error) {
    return thunkAPI.rejectWithValue(error?.response?.data?.message || error.message || "Something went wrong!");
    }
  }
);
export const updateATax = createAsyncThunk(
  "tax/update-tax",
  async (tax, thunkAPI) => {
    try {
      return await taxService.updateTax(tax);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);
export const getstatus = createAsyncThunk(
  "tax/get-status",
  async (tax, thunkAPI) => {
    try {
      return await taxService.getstatus(tax);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);
export const deleteATax = createAsyncThunk(
  "tax/delete-tax",
  async (id, thunkAPI) => {
    try {
      return await taxService.deleteTax(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const resetState = createAction("Reset_all");

const initialState = {
  taxs: [],
  isError: false,
  isLoading: false,
  isSuccess: false,
  message: "",
};
export const taxSlice = createSlice({
  name: "taxs",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTaxs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTaxs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.taxs = action.payload;
      })
      .addCase(getTaxs.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.error;
      })
      .addCase(createTax.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createTax.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.createdTax = action.payload;
      })
      .addCase(createTax.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload;
      })
      .addCase(getATax.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getATax.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.taxName = action.payload.title;
      })
      .addCase(getATax.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.error;
      })
      .addCase(updateATax.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateATax.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.updatedTax = action.payload;
      })
      .addCase(updateATax.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.error;
      })
      .addCase(getstatus.pending, (state) => {
              state.isLoading = true;
            })
            .addCase(getstatus.fulfilled, (state, action) => {
              state.isLoading = false;
              state.isError = false;
              state.isSuccess = true;
              state.getstatuss = action.payload;
            })
            .addCase(getstatus.rejected, (state, action) => {
              state.isLoading = false;
              state.isError = true;
              state.isSuccess = false;
              state.message = action.error;
            })
      
      .addCase(deleteATax.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteATax.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.deletedTax = action.payload;
      })
      .addCase(deleteATax.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.error;
      })
      .addCase(resetState, () => initialState);
  },
});

export default taxSlice.reducer;
