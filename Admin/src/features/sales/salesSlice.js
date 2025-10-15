import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import invoiceService from "./salesServices";

const initialState = {
  orders:[],
  isError: false,
  isLoading: false,
  isSuccess: false,
  message: "",
};


export const getReport = createAsyncThunk(
  "invoices/getReport",
  async (data, thunkAPI) => {
    try {
      return await invoiceService.getReport(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);


export const getOrders = createAsyncThunk(
  "invoices/sales-report",
   async (data, thunkAPI) => {
     try {
       return await invoiceService.getOrders(data);
     } catch (error) {
       return thunkAPI.rejectWithValue(error);
     }
   }
 );
 

export const invoiceSlice = createSlice({
  name: "sales",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder   
            .addCase(getOrders.pending, (state) => {
              state.isLoading = true;
             })
            .addCase(getOrders.fulfilled, (state, action) => {
              state.isError = false;
              state.isLoading = false;
              state.isSuccess = true;
              state.orders = action.payload;
              state.message = "success";
            })
            .addCase(getOrders.rejected, (state, action) => {
              state.isError = true;
              state.isSuccess = false;
              state.message = action.error;
              state.isLoading = false;
            })
            .addCase(getReport.pending, (state) => {
              state.isLoading = true;
             })
            .addCase(getReport.fulfilled, (state, action) => {
              state.isError = false;
              state.isLoading = false;
              state.isSuccess = true;
              state.report = action.payload;
              state.message = "success";
            })
            .addCase(getReport.rejected, (state, action) => {
              state.isError = true;
              state.isSuccess = false;
              state.message = action.error;
              state.isLoading = false;
            });
  },
});

export default invoiceSlice.reducer;
