import { createSlice, createAsyncThunk,createAction } from "@reduxjs/toolkit";
import invoiceService from "./invoiceServices";

const initialState = {
  
  isError: false,
  isLoading: false,
  isSuccess: false,
  message: "",
};
export const getASales = createAsyncThunk(
  "invoice/get-invoice",
  async (id, thunkAPI) => {
    try {
      return await invoiceService.getASales(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const CreateSale = createAsyncThunk(
  "orders/add-invoice",
  async (invoiceData, thunkAPI) => {
    try {
      return await invoiceService.CreateSale(invoiceData);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);
export const updateSales = createAsyncThunk(
  "invoice/update-invoice",
  async (invoice, thunkAPI) => {
    try {
      return await invoiceService.updateSales(invoice);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const Billno = createAsyncThunk(
  "orders/Billno",
  async (_, thunkAPI) => {
    try {
      return await invoiceService.Billno();
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const getTodayData = createAsyncThunk(
  "orders/todaydata",
  async (data, thunkAPI) => {
    try {
      return await invoiceService.getTodayStats(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);


export const getOrders = createAsyncThunk(
  "invoices/get-alls",
   async (data, thunkAPI) => {
     try {
       return await invoiceService.getOrders(data);
     } catch (error) {
       return thunkAPI.rejectWithValue(error);
     }
   }
 );
export const resetState = createAction("Reset_all");


export const invoiceSlice = createSlice({
  name: "invoice",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder  
           .addCase(CreateSale.pending, (state) => {
            state.isLoading = true;
          })
          .addCase(CreateSale.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = true;
           
          })
          .addCase(CreateSale.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.isSuccess = false;
            state.message = action.error;
          })
          .addCase(getASales.pending, (state) => {
            state.isLoading = true;
           })
          .addCase(getASales.fulfilled, (state, action) => {
                  state.isLoading = false;
                  state.isError = false;
                  state.isSuccess = true;
                 state.singleInvoice = action.payload;
                })
                .addCase(getASales.rejected, (state, action) => {
                  state.isLoading = false;
                  state.isError = true;
                  state.isSuccess = false;
                  state.message = action.error;
                })           
          .addCase(Billno.pending, (state) => {
            state.isLoading = true;
          })
          .addCase(Billno.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = true;
            state.invoiceno = action.payload;  
          })
          .addCase(Billno.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.isSuccess = false;
            state.message = action.error;
          })
         .addCase(updateSales.pending, (state) => {
            state.isLoading = true;
          })
          .addCase(updateSales.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = true;
            state.updatedSales = action.payload;
          })
          .addCase(updateSales.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.isSuccess = false;
            state.message = action.error;
          })
            .addCase(getTodayData.pending, (state) => {
              state.isLoading = true;
            })
            .addCase(getTodayData.fulfilled, (state, action) => {
              state.isError = false;
              state.isLoading = false;
              state.isSuccess = true;
              state.todayData = action.payload;
              state.message = "success";
            })
            .addCase(getTodayData.rejected, (state, action) => {
              state.isError = true;
              state.isSuccess = false;
              state.message = action.error;
              state.isLoading = false;
            })
            
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
            .addCase(resetState, () => initialState);
  },
});

export default invoiceSlice.reducer;
