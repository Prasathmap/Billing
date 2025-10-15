import { createSlice, createAsyncThunk, createAction } from "@reduxjs/toolkit";
import salestypeService from "./salestypeService";

export const getSalestypes = createAsyncThunk(
  "salestype/get-salestypes",
  async (thunkAPI) => {
    try {
      return await salestypeService.getSalestypes();
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);
export const getASalestype = createAsyncThunk(
  "salestype/get-salestype",
  async (id, thunkAPI) => {
    try {
      return await salestypeService.getSalestype(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);
export const getstatus = createAsyncThunk(
  "salestype/get-status",
  async (salestype, thunkAPI) => {
    try {
      return await salestypeService.getstatus(salestype);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const createSalestype = createAsyncThunk(
  "salestype/create-salestype",
  async (salestypeData, thunkAPI) => {
    try {
      return await salestypeService.createSalestype(salestypeData);
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data?.message || error.message || "Something went wrong!");
    }
  }
);
export const updateSalestype = createAsyncThunk(
  "salestype/update-salestype",
  async (salestype, thunkAPI) => {
    try {
      return await salestypeService.updateSalestype(salestype);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const deleteSalestype = createAsyncThunk(
  "salestype/delete-salestype",
  async (id, thunkAPI) => {
    try {
      return await salestypeService.deleteSalestype(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const resetState = createAction("Reset_all");

const initialState = {
  salestypes: [],
  isError: false,
  isLoading: false,
  isSuccess: false,
  message: "",
};
export const salestypeSlice = createSlice({
  name: "salestypes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSalestypes.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSalestypes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.salestypes = action.payload;
      })
      .addCase(getSalestypes.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.error;
      })
      .addCase(createSalestype.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createSalestype.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.createdSalestype = action.payload;
      })
      .addCase(createSalestype.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload;
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
      .addCase(getASalestype.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getASalestype.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.salestypeName = action.payload.title;
      })
      .addCase(getASalestype.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.error;
      })
      .addCase(updateSalestype.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateSalestype.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.updatedSalestype = action.payload;
      })
      .addCase(updateSalestype.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.error;
      })
      .addCase(deleteSalestype.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteSalestype.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.deletedSalestype = action.payload;
      })
      .addCase(deleteSalestype.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.error;
      })
      .addCase(resetState, () => initialState);
  },
});

export default salestypeSlice.reducer;
