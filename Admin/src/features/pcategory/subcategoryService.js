import axios from "axios";
import { config } from "../../utils/axiosconfig";
import { base_url } from "../../utils/baseUrl";
const getSubcategorys = async () => {
  const response = await axios.get(`${base_url}subcategory/` ,config);
  return response.data;
};

const createSubcategory = async (subcategory) => {
  const response = await axios.post(`${base_url}subcategory/`, subcategory, config);

  return response.data;
};
const updateSubcategory = async (subcategory) => {
  const response = await axios.put(
    `${base_url}subcategory/${subcategory.id}`,
    { title: subcategory.subcategoryData.title },
    config
  );

  return response.data;
};
const getSubcategory = async (id) => {
  const response = await axios.get(`${base_url}subcategory/${id}`, config);

  return response.data;
};

const deleteSubcategory = async (id) => {
  const response = await axios.delete(`${base_url}subcategory/${id}`, config);

  return response.data;
};
const getstatus = async (subcategory) => {
  const response = await axios.put(`${base_url}subcategory/status/${subcategory.id}`,{}, config); 
  return response.data;
};

const subcategoryService = {
  getSubcategorys,
  createSubcategory,
  getSubcategory,
  updateSubcategory,
  deleteSubcategory,
  getstatus,
};

export default subcategoryService;
