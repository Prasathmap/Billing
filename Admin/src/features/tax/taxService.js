import axios from "axios";
import { config } from "../../utils/axiosconfig";
import { base_url } from "../../utils/baseUrl";
const getTaxs = async () => {
  const response = await axios.get(`${base_url}tax/` ,config);

  return response.data;
};

const createTax = async (tax) => {
  const response = await axios.post(`${base_url}tax/`, tax, config);

  return response.data;
};
const updateTax = async (tax) => {
  const response = await axios.put(
    `${base_url}tax/${tax.id}`,
    { title: tax.taxData.title },
    config
  );

  return response.data;
};
const getTax = async (id) => {
  const response = await axios.get(`${base_url}tax/${id}`, config);

  return response.data;
};

const deleteTax = async (id) => {
  const response = await axios.delete(`${base_url}tax/${id}`, config);

  return response.data;
};
const getstatus = async (tax) => {
  const response = await axios.put(`${base_url}tax/status/${tax.id}`,{}, config); 
  return response.data;
};

const taxService = {
  getTaxs,
  createTax,
  getTax,
  updateTax,
  deleteTax,
  getstatus,
};

export default taxService;
