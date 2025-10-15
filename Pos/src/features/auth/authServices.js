import axios from "axios";
import { base_url } from "../../utils/baseUrl";
import { config } from "../../utils/axiosconfig";

// Login function
const login = async (userData) => {
  const response = await axios.post(`${base_url}pos/loginPos`, userData);
  if (response.data) {localStorage.setItem("pos", JSON.stringify(response.data));}
  return response.data;
};


const getProfiles = async () => {
  const response = await axios.get(`${base_url}store/`, config);

  return response.data;
};


const authService = { 
  login,
  getProfiles,
 };
export default authService;
