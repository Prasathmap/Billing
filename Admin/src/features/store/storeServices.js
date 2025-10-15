import axios from "axios";
import { config } from "../../utils/axiosconfig";
import { base_url } from "../../utils/baseUrl";

const createStore = async (profile) => {
    const response = await axios.post(`${base_url}store/`,profile, config );
    if (response.data) {
      return response.data;
    }
  };
  const getStore = async () => {
    const response = await axios.get(`${base_url}store/`, config);
  
    return response.data;
  };
  const getStores = async (id) => {
    const response = await axios.get(`${base_url}store/${id}`, config );
    if (response.data) {
      return response.data;
    }
  };
  const updateStores = async (profile) => {
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
  
  const storeService = {   
    createStore,
    getStore,
    getStores,
    updateStores,
  };
  
  export default storeService;
  