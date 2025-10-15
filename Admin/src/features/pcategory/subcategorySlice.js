import { createSlice, createAsyncThunk, createAction } from "@reduxjs/toolkit";
import subcategoryService from "./subcategoryService";

export const getSubcategorys = createAsyncThunk(
  "subcategory/get-subcategorys",
  async (thunkAPI) => {
    try {
      return await subcategoryService.getSubcategorys();
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);
export const getSubcategory = createAsyncThunk(
  "subcategory/get-subcategory",
  async (id, thunkAPI) => {
    try {
      return await subcategoryService.getSubcategory(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);
export const createSubcategory = createAsyncThunk(
  "subcategory/create-subcategory",
  async (subcategoryData, thunkAPI) => {
    try {
      return await subcategoryService.createSubcategory(subcategoryData);
    } catch (error) {
    return thunkAPI.rejectWithValue(error?.response?.data?.message || error.message || "Something went wrong!");
    }
  }
);
export const updateSubcategory = createAsyncThunk(
  "subcategory/update-subcategory",
  async (subcategory, thunkAPI) => {
    try {
      return await subcategoryService.updateSubcategory(subcategory);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);
export const getstatus = createAsyncThunk(
  "subcategory/get-status",
  async (subcategory, thunkAPI) => {
    try {
      return await subcategoryService.getstatus(subcategory);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);
export const deleteSubcategory = createAsyncThunk(
  "subcategory/delete-subcategory",
  async (id, thunkAPI) => {
    try {
      return await subcategoryService.deleteSubcategory(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const resetState = createAction("Reset_all");

const initialState = {
  subcategories: [],
  isError: false,
  isLoading: false,
  isSuccess: false,
  message: "",
};
export const subcategorySlice = createSlice({
  name: "subcategories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSubcategorys.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSubcategorys.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.subcategories = action.payload;
      })
      .addCase(getSubcategorys.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.error;
      })
      .addCase(createSubcategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createSubcategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.createdSubcategory = action.payload;
      })
      .addCase(createSubcategory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload;
      })
      .addCase(getSubcategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSubcategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.subcategoryName = action.payload.title;
      })
      .addCase(getSubcategory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.error;
      })
      .addCase(updateSubcategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateSubcategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.updatedSubcategory = action.payload;
      })
      .addCase(updateSubcategory.rejected, (state, action) => {
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
      .addCase(deleteSubcategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteSubcategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.deletedSubacategory = action.payload;
      })
      .addCase(deleteSubcategory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.error;
      })
      .addCase(resetState, () => initialState);
  },
});

export default subcategorySlice.reducer;
