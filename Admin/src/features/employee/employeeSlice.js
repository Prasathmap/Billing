import { createSlice, createAsyncThunk, createAction } from "@reduxjs/toolkit";
import employeeService from "./employeeService";

export const getEmployees = createAsyncThunk(
  "employee/get-employees",
  async (thunkAPI) => {
    try {
      return await employeeService.getEmployees();
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const getstatus = createAsyncThunk(
  "employee/get-status",
  async (employee, thunkAPI) => {
    try {
      return await employeeService.getstatus(employee);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);
export const getAEmployee = createAsyncThunk(
  "employee/get-employee",
  async (id, thunkAPI) => {
    try {
      return await employeeService.getEmployee(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);
export const createEmployee = createAsyncThunk(
  "employee/create-employee",
  async (employeeData, thunkAPI) => {
    try {
      return await employeeService.createEmployee(employeeData);
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data?.message || error.message || "Something went wrong!");
    }
  }
);
export const updateEmployee = createAsyncThunk(
  "employee/update-employee",
  async (employee, thunkAPI) => {
    try {
      return await employeeService.updateEmployee(employee);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  "employee/delete-employee",
  async (id, thunkAPI) => {
    try {
      return await employeeService.deleteEmployee(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const resetState = createAction("Reset_all");

const initialState = {
  employees: [],
  isError: false,
  isLoading: false,
  isSuccess: false,
  message: "",
};
export const employeeSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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
      .addCase(createEmployee.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.createdEmployee = action.payload;
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload;
      })
      .addCase(getAEmployee.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAEmployee.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.employeeName = action.payload.title;
        state.empcode = action.payload.empcode;
        state.phone = action.payload.phone;
      })
      .addCase(getAEmployee.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.error;
      })
      .addCase(updateEmployee.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.updatedEmployee = action.payload;
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.error;
      })
      .addCase(deleteEmployee.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.deletedEmployee = action.payload;
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.error;
      })
      .addCase(resetState, () => initialState);
  },
});

export default employeeSlice.reducer;
