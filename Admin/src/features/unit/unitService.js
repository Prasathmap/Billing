import axios from "axios";
import { config } from "../../utils/axiosconfig";
import { base_url } from "../../utils/baseUrl";
const getUnits = async () => {
  const response = await axios.get(`${base_url}unit/`,config);

  return response.data;
};

const createUnit = async (unit) => {
  const response = await axios.post(`${base_url}unit/`, unit, config);

  return response.data;
};
const updateUnit = async (unit) => {
  const response = await axios.put(
    `${base_url}unit/${unit.id}`,
    { title: unit.unitData.title },
    config
  );

  return response.data;
};
const getUnit = async (id) => {
  const response = await axios.get(`${base_url}unit/${id}`, config);

  return response.data;
};

const deleteUnit = async (id) => {
  const response = await axios.delete(`${base_url}unit/${id}`, config);

  return response.data;
};

const getstatus = async (unit) => {
  const response = await axios.put(`${base_url}unit/status/${unit.id}`,{}, config); 
  return response.data;
};
const unitService = {
  getUnits,
  createUnit,
  getUnit,
  updateUnit,
  deleteUnit,
  getstatus,
};

export default unitService;
