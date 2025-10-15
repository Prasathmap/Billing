import { createSlice, createAsyncThunk, createAction } from "@reduxjs/toolkit";
import attenderService from "./attenderService";

export const getAttenders = createAsyncThunk(
  "attender/get-attenders",
  async (thunkAPI) => {
    try {
      return await attenderService.getAttenders();
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);
export const getAAttender = createAsyncThunk(
  "attender/get-attender",
  async (id, thunkAPI) => {
    try {
      return await attenderService.getAttender(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const getstatus = createAsyncThunk(
  "attender/get-status",
  async (attender, thunkAPI) => {
    try {
      return await attenderService.getstatus(attender);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);
export const createAttender = createAsyncThunk(
  "attender/create-attender",
  async (attenderData, thunkAPI) => {
    try {
      return await attenderService.createAttender(attenderData);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);
export const updateAAttender = createAsyncThunk(
  "attender/update-attender",
  async (attender, thunkAPI) => {
    try {
      return await attenderService.updateAttender(attender);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const deleteAAttender = createAsyncThunk(
  "attender/delete-attender",
  async (id, thunkAPI) => {
    try {
      return await attenderService.deleteAttender(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const resetState = createAction("Reset_all");

const initialState = {
  attenders: [],
  isError: false,
  isLoading: false,
  isSuccess: false,
  message: "",
};
export const attenderSlice = createSlice({
  name: "attenders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAttenders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAttenders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.attenders = action.payload;
      })
      .addCase(getAttenders.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.error;
      })
      .addCase(createAttender.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createAttender.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.createdAttender = action.payload;
      })
      .addCase(createAttender.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.error;
      })
      .addCase(getAAttender.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAAttender.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.phone = action.payload.phone;
        state.password = action.payload.password;
      })
      .addCase(getAAttender.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.error;
      })
      .addCase(updateAAttender.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateAAttender.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.updatedAttender = action.payload;
      })
      .addCase(updateAAttender.rejected, (state, action) => {
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
      .addCase(deleteAAttender.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteAAttender.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.deletedAttender = action.payload;
      })
      .addCase(deleteAAttender.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.error;
      })
      .addCase(resetState, () => initialState);
  },
});

export default attenderSlice.reducer;
