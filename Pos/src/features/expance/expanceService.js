import axios from "axios";
import { config } from "../../utils/axiosconfig";
import { base_url } from "../../utils/baseUrl";

const getExpancecat = async () => {
  const response = await axios.get(`${base_url}expcat/`, config);
  return response.data;
};

const getExpances = async () => {
  const response = await axios.get(`${base_url}expance/`, config);

  return response.data;
};

const createExpance = async (expance) => {
  const response = await axios.post(`${base_url}expance/`, expance, config);

  return response.data;
};
const updateExpance = async (expance) => {
  const response = await axios.put(
    `${base_url}expance/${expance.id}`,
    { category: expance.expanceData.category,
      amount: expance.expanceData.amount,
      paymentMethod: expance.expanceData.paymentMethod,
     },
    config
  );

  return response.data;
};
const getExpance = async (id) => {
  const response = await axios.get(`${base_url}expance/${id}`, config);

  return response.data;
};

const deleteExpance = async (id) => {
  const response = await axios.delete(`${base_url}expance/${id}`, config);

  return response.data;
};

const getTodayStats = async () => {
  const response = await axios.get(`${base_url}expance/getReport`,config);
  return response.data;
};


const expanceService = {
  getExpancecat,
  getExpance,
  createExpance,
  getExpances,
  updateExpance,
  deleteExpance,
  getTodayStats,
};

export default expanceService;
