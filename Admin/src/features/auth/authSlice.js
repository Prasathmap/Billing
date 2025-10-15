import { createSlice, createAsyncThunk,createAction } from "@reduxjs/toolkit";
import authService from "./authServices";
import { toast } from "react-toastify";

const getUserfromLocalStorage = localStorage.getItem("user")
  ? JSON.parse(localStorage.getItem("user"))
  : null;
const initialState = {
  user: getUserfromLocalStorage,
  orders: [],
  isError: false,
  isLoading: false,
  isSuccess: false,
  message: "",
};

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, thunkAPI) => {
    try {
      return await authService.register(userData);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);
export const sendOtp = createAsyncThunk(
  "auth/sendOtp",
 async ({ email }, thunkAPI) => {
  try {
    return await authService.sendOtp(email);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data);
  }
});

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async ({ email, emailOtp }, thunkAPI) => {
  try {
    return await authService.verifyOtp(email,  emailOtp);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data);
  }
});

export const login = createAsyncThunk(
  "auth/login",
  async (userData, thunkAPI) => {
    try {
      return await authService.login(userData);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);
export const CreateProfile = createAsyncThunk(
  "auth/create-profile",
  async (profileData, thunkAPI) => {
    try {
      return await authService.CreateProfile(profileData);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const UpdateProfile = createAsyncThunk(
  "auth/update-profile",
  async (profile, thunkAPI) => {
    try {
      return await authService.UpdateProfile(profile);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);
export const GetProfile = createAsyncThunk(
  "auth/get-profile",
  async (id, thunkAPI) => {
    try {
      return await authService.GetProfile(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const getProfiles = createAsyncThunk(
  "auth/get-profiles",
  async (thunkAPI) => {
    try {
      return await authService.getProfiles();
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const resetState = createAction("Reset_all");

export const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {},
  extraReducers: (buildeer) => {
    buildeer
    .addCase(registerUser.pending, (state) => {
      state.isLoading = true;
    })
    .addCase(registerUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = true;
      state.createdUser = action.payload;
      if (state.isSuccess === true) {
        toast.info("User Created Successfully");
      }
    })
    .addCase(registerUser.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.error;
      if (state.isError === true) {
        toast.error(action.payload.response.data.message);
      }
    })
    .addCase(sendOtp.pending, (state) => {
      state.isLoading = true;
    })
    .addCase(sendOtp.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = true;
      state.otpSent = action.payload;
    })
    .addCase(sendOtp.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.error;
      if (state.isError === true) {
        toast.error(action.payload.response.data.message);
      }
    })

    .addCase(verifyOtp.pending, (state) => {
      state.isLoading = true;
    })
    .addCase(verifyOtp.fulfilled, (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = true;
      state.otpVerified = true;
    })
    .addCase(verifyOtp.rejected, (state, action) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.message = action.error;
      if (state.isError === true) {
        toast.error(action.payload.response.data.message);
      }
    })

      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isError = false;
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
        state.message = "success";
      })
      .addCase(login.rejected, (state, action) => {
        state.isError = true;
        state.isSuccess = false;
        state.message = action.error;
        state.isLoading = false;
      })
       .addCase(CreateProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(CreateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.createdProfile = action.payload;
        })
      .addCase(CreateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.error;
        if (state.isError) {
          toast.error("Something Went Wrong!");
        }
      })
      .addCase(UpdateProfile.pending, (state) => {
        state.isLoading = true;
      })
    .addCase(UpdateProfile.fulfilled, (state, action) => {
       state.isLoading = false;
       state.isError = false;
       state.isSuccess = true;
      state.updatedProfile = action.payload;
      })
    .addCase(UpdateProfile.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.error;
    })
    .addCase(GetProfile.pending, (state) => {
            state.isLoading = true;
          })
          .addCase(GetProfile.fulfilled, (state, action) => {
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
          .addCase(GetProfile.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.isSuccess = false;
            state.message = action.error;
          })
          .addCase(getProfiles.pending, (state) => {
                  state.isLoading = true;
                })
                .addCase(getProfiles.fulfilled, (state, action) => {
                  state.isLoading = false;
                  state.isError = false;
                  state.isSuccess = true;
                  state.profiles = action.payload;
                })
                .addCase(getProfiles.rejected, (state, action) => {
                  state.isLoading = false;
                  state.isError = true;
                  state.isSuccess = false;
                  state.message = action.error;
                })
                .addCase(resetState, () => initialState);
  },
});

export default authSlice.reducer;
