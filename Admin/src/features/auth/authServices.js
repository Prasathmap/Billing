import axios from "axios";
import { config } from "../../utils/axiosconfig";
import { base_url } from "../../utils/baseUrl";

// Register User
const register = async (userData) => {
  const response = await axios.post(`${base_url}auth/register`, userData);
  if (response.data) {
    return response.data;
  }
};
// Send OTP
const sendOtp = async (email) => {
  const response = await axios.post(`${base_url}auth/send-otp`, { email });
  return response.data;
};

//Verify OTP
const verifyOtp = async (email,emailOtp) => {
  const response = await axios.post(`${base_url}auth/verify-otp`, { email, emailOtp });
  return response.data;
};

//login
const login = async (user) => {
  const response = await axios.post(`${base_url}auth/admin-login`, user);
  if (response.data) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

const CreateProfile = async (profile) => {
  const response = await axios.post(`${base_url}store/`,profile, config );
  if (response.data) {
    return response.data;
  }
};
const getProfiles = async () => {
  const response = await axios.get(`${base_url}store/`, config);

  return response.data;
};
const GetProfile = async (id) => {
  const response = await axios.get(`${base_url}store/${id}`, config );
  if (response.data) {
    return response.data;
  }
};
const UpdateProfile = async (profile) => {
  const response = await axios.put(
    `${base_url}store/${profile.id}`,
    { storeName: profile.profileData.storeName,
      address: profile.profileData.address,
      state: profile.profileData.state,
      city: profile.profileData.city,
      village: profile.profileData.village,
      pincode: profile.profileData.pincode,
      pancard: profile.profileData.pancard,
      gstno: profile.profileData.gstno,
     },
    config
  );

  return response.data;
};

const authService = {
  register,
  sendOtp,
  verifyOtp,
  login,   
  CreateProfile,
  GetProfile,
  getProfiles,
  UpdateProfile,
};

export default authService;
