import { createSlice, createAsyncThunk,createAction } from "@reduxjs/toolkit";
import storeService from "./storeServices";
import { toast } from "react-toastify";
export const createStore = createAsyncThunk(
    "store/create-store",
    async (storeData, thunkAPI) => {
      try {
        return await storeService.createStore(storeData);
      } catch (error) {
        return thunkAPI.rejectWithValue(error);
      }
    }
  );
  
  export const updateStore = createAsyncThunk(
    "store/update-store",
    async (store, thunkAPI) => {
      try {
        return await storeService.updateStore(store);
      } catch (error) {
        return thunkAPI.rejectWithValue(error);
      }
    }
  );
  export const getStore = createAsyncThunk(
    "store/get-store",
    async (id, thunkAPI) => {
      try {
        return await storeService.getStore(id);
      } catch (error) {
        return thunkAPI.rejectWithValue(error);
      }
    }
  );
  
  export const getStores = createAsyncThunk(
    "store/get-stores",
    async (thunkAPI) => {
      try {
        return await storeService.getStores();
      } catch (error) {
        return thunkAPI.rejectWithValue(error);
      }
    }
  );
  export const resetState = createAction("Reset_all");

  const initialState = {
    store: [],
    isError: false,
    isLoading: false,
    isSuccess: false,
    message: "",
  };
export const storeSlice = createSlice({
  name: "store",
  initialState: initialState,
  reducers: {},
  extraReducers: (buildeer) => {
    buildeer
    
       .addCase(createStore.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createStore.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.createdProfile = action.payload;
        })
      .addCase(createStore.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.error;
        if (state.isError) {
          toast.error("Something Went Wrong!");
        }
      })
      .addCase(updateStore.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateStore.fulfilled, (state, action) => {
       state.isLoading = false;
       state.isError = false;
       state.isSuccess = true;
       state.updatedProfile = action.payload;
      })
    .addCase(updateStore.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.error;
    })
    .addCase(getStore.pending, (state) => {
            state.isLoading = true;
          })
          .addCase(getStore.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = true;
            state.storeName = action.payload.storeName;
            state.storePancard = action.payload.pancard;
            state.storeGstno = action.payload.gstno;
            state.storeAddress = action.payload.address;
            state.storeState = action.payload.state;
            state.storeCity = action.payload.city;
            state.storeVillage = action.payload.village;
            state.storePincode = action.payload.pincode;

          })
          .addCase(getStore.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.isSuccess = false;
            state.message = action.error;
          })
          .addCase(getStores.pending, (state) => {
             state.isLoading = true;
            })
            .addCase(getStores.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isError = false;
                state.isSuccess = true;
                state.profiles = action.payload;
              })
              .addCase(getStores.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.isSuccess = false;
                state.message = action.error;
              })
              .addCase(resetState, () => initialState);              
  },
});

export default storeSlice.reducer;

  