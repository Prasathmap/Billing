import axios from "axios";
import { config } from "../../utils/axiosconfig";
import { base_url } from "../../utils/baseUrl";

const getExpances = async () => {
  const response = await axios.get(`${base_url}expcat/`, config);

  return response.data;
};

const createExpance = async (expance) => {
  const response = await axios.post(`${base_url}expcat/`, expance, config);

  return response.data;
};
const updateExpance = async (expance) => {
  const response = await axios.put(
    `${base_url}expcat/${expance.id}`,
    { title: expance.expanceData.title },
    config
  );

  return response.data;
};
const getExpance = async (id) => {
  const response = await axios.get(`${base_url}expcat/${id}`, config);

  return response.data;
};

const deleteExpance = async (id) => {
  const response = await axios.delete(`${base_url}expcat/${id}`, config);

  return response.data;
};

const getExpanceReport = async (data) => {
  const response = await axios.get(`${base_url}expance/getReport`,data, config );
  return response.data;
};

const getstatus = async (expance) => {
  const response = await axios.put(`${base_url}expcat/status/${expance.id}`,{}, config); 
  return response.data;
};
const expanceService = {
  getExpance,
  createExpance,
  getExpances,
  updateExpance,
  deleteExpance,
  getExpanceReport,
  getstatus,
};

export default expanceService;
