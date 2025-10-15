import { createSlice, createAsyncThunk, createAction } from "@reduxjs/toolkit";
import salesService from "./salesService";

export const getProducts = createAsyncThunk(
  "product/get-products",
  async (thunkAPI) => {
    try {
      return await salesService.getProducts();
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);
export const getCategories = createAsyncThunk(
  "productCategory/get-categories",
  async (thunkAPI) => {
    try {
      return await salesService.getProductCategories();
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);
export const getEmployees = createAsyncThunk(
  "employee/get-employees",
  async (thunkAPI) => {
    try {
      return await salesService.getEmployees();
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);
export const getSalestypes = createAsyncThunk(
  "salestype/get-salestypes",
  async (thunkAPI) => {
    try {
      return await salesService.getSalestypes();
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);
export const resetState = createAction("Reset_all");

const initialState = {
  products: [],
  pCategories: [],
  employees: [],
  salestypes: [],
  isError: false,
  isLoading: false,
  isSuccess: false,
  message: "",
};
export const productSlice = createSlice({
  name: "sales",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
    .addCase(getCategories.pending, (state) => {
            state.isLoading = true;
          })
          .addCase(getCategories.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = true;
            state.pCategories = action.payload;
          })
          .addCase(getCategories.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.isSuccess = false;
            state.message = action.error;
          })
      .addCase(getProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.products = action.payload;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.error;
      })
      .addCase(getEmployees.pending, (state) => {
              state.isLoading = true;
            })
            .addCase(getEmployees.fulfilled, (state, action) => {
              state.isLoading = false;
              state.isError = false;
              state.isSuccess = true;
              state.employees = action.payload;
            })
            .addCase(getEmployees.rejected, (state, action) => {
              state.isLoading = false;
              state.isError = true;
              state.isSuccess = false;
              state.message = action.error;
            })
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
                 
    }
});
export default productSlice.reducer;
