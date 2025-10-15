import axios from "axios";
import { config } from "../../utils/axiosconfig";
import { base_url } from "../../utils/baseUrl";
const getSalestypes = async () => {
  const response = await axios.get(`${base_url}salestype/`, config);

  return response.data;
};

const createSalestype = async (salestype) => {
  const response = await axios.post(`${base_url}salestype/`, salestype, config);

  return response.data;
};
const updateSalestype = async (salestype) => {
  const response = await axios.put(
    `${base_url}salestype/${salestype.id}`,
    { title: salestype.salestypeData.title },
    config
  );

  return response.data;
};
const getSalestype = async (id) => {
  const response = await axios.get(`${base_url}salestype/${id}`, config);

  return response.data;
};

const deleteSalestype = async (id) => {
  const response = await axios.delete(`${base_url}salestype/${id}`, config);

  return response.data;
};
const getstatus = async (salestype) => {
  const response = await axios.put(`${base_url}salestype/status/${salestype.id}`,{}, config); 
  return response.data;
};

const salestypeService = {
  getSalestypes,
  createSalestype,
  getSalestype,
  updateSalestype,
  deleteSalestype,
  getstatus,
};

export default salestypeService;
