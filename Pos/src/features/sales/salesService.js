import axios from "axios";
import { base_url } from "../../utils/baseUrl";
import { config } from "../../utils/axiosconfig";


const getProducts = async () => {
  const response = await axios.get(`${base_url}product`, config);
  return response.data;
};
const getProductCategories = async () => {
  const response = await axios.get(`${base_url}category/`,config);

  return response.data;
};
const getEmployees = async () => {
  const response = await axios.get(`${base_url}employee/`, config);

  return response.data;
};
const getSalestypes = async () => {
  const response = await axios.get(`${base_url}salestype/`, config);
  return response.data;
};
const salesService = {
  getProducts,
  getProductCategories,
  getEmployees,
  getSalestypes,
};

export default salesService;
