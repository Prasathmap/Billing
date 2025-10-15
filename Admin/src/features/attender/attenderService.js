import axios from "axios";
import { config } from "../../utils/axiosconfig";
import { base_url } from "../../utils/baseUrl";
const getAttenders = async () => {
  const response = await axios.get(`${base_url}pos/`,config);
  return response.data;
};

const createAttender = async (attender) => {
  const response = await axios.post(`${base_url}pos/`, attender, config);

  return response.data;
};
const updateAttender = async (attender) => {
  const response = await axios.put(
    `${base_url}pos/${attender.id}`,
    { phone: attender.attenderData.phone,
      password: attender.attenderData.password,
      
     },
    config
  );

  return response.data;
};
const getAttender = async (id) => {
  const response = await axios.get(`${base_url}pos/${id}`, config);

  return response.data;
};

const deleteAttender = async (id) => {
  const response = await axios.delete(`${base_url}pos/${id}`, config);

  return response.data;
};
const getstatus = async (attender) => {
  const response = await axios.put(`${base_url}pos/status/${attender.id}`,{}, config); 
  return response.data;
};
const attenderService = {
  getAttenders,
  createAttender,
  getAttender,
  updateAttender,
  deleteAttender,
  getstatus,
};

export default attenderService;
