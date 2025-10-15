import { createSlice, createAsyncThunk, createAction } from "@reduxjs/toolkit";
import expanceService from "./expanceService";

export const getExpancecat = createAsyncThunk(
  "expance/get-expancescat",
  async (thunkAPI) => {
    try {
      return await expanceService.getExpancecat();
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);


export const getExpances = createAsyncThunk(
  "expance/get-expances",
  async (thunkAPI) => {
    try {
      return await expanceService.getExpances();
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);
export const getAExpance = createAsyncThunk(
  "expance/get-expance",
  async (id, thunkAPI) => {
    try {
      return await expanceService.getExpance(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);
export const createExpance = createAsyncThunk(
  "expance/create-expance",
  async (expanceData, thunkAPI) => {
    try {
      return await expanceService.createExpance(expanceData);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);
export const updateAExpance = createAsyncThunk(
  "expance/update-expance",
  async (expance, thunkAPI) => {
    try {
      return await expanceService.updateExpance(expance);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const deleteAExpance = createAsyncThunk(
  "expance/delete-expance",
  async (id, thunkAPI) => {
    try {
      return await expanceService.deleteExpance(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);
export const getTodayExpance = createAsyncThunk(
  "expance/getTodayExpance",
  async (data, thunkAPI) => {
    try {
      return await expanceService.getTodayStats(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);
export const resetState = createAction("Reset_all");

const initialState = {
  expances: [],
  isError: false,
  isLoading: false,
  isSuccess: false,
  message: "",
};
export const expanceSlice = createSlice({
  name: "expances",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

    .addCase(getExpancecat.pending, (state) => {
      state.isLoading = true;
    })
    .addCase(getExpancecat.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = true;
      state.expenseCategories = action.payload;
    })
    .addCase(getExpancecat.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.error;
    })
      .addCase(getExpances.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getExpances.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.expances = action.payload;
      })
      .addCase(getExpances.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.error;
      })
      .addCase(createExpance.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createExpance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.createdExpance = action.payload;
      })
      .addCase(createExpance.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.error;
      })
      .addCase(getAExpance.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAExpance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.expanceName = action.payload.category;
        state.expanceAmount = action.payload.amount;
        state.expanceMethod = action.payload.paymentMethod;

      })
      .addCase(getAExpance.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.error;
      })
      .addCase(updateAExpance.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateAExpance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.updatedExpance = action.payload;
      })
      .addCase(updateAExpance.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.error;
      })
      .addCase(deleteAExpance.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteAExpance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.deletedExpance = action.payload;
      })
      .addCase(deleteAExpance.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.error;
      })
     .addCase(getTodayExpance.pending, (state) => {
         state.isLoading = true;
       })
            .addCase(getTodayExpance.fulfilled, (state, action) => {
              state.isError = false;
              state.isLoading = false;
              state.isSuccess = true;
              state.todayExpance = action.payload;
              state.message = "success";
            })
            .addCase(getTodayExpance.rejected, (state, action) => {
              state.isError = true;
              state.isSuccess = false;
              state.message = action.error;
              state.isLoading = false;
            })
                  
      .addCase(resetState, () => initialState);
  },
});

export default expanceSlice.reducer;
