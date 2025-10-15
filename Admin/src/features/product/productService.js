import axios from "axios";
import { config } from "../../utils/axiosconfig";
import { base_url } from "../../utils/baseUrl";

const getProducts = async () => {
  const response = await axios.get(`${base_url}product/`,config);

  return response.data;
};
const createProduct = async (product) => {
  const response = await axios.post(`${base_url}product/`, product, config);

  return response.data;
};

const getProduct = async (id) => {
  const response = await axios.get(`${base_url}product/${id}`, config);

  return response.data;
};

const updateProduct = async (product) => {
  const response = await axios.put(
    `${base_url}product/${product.id}`,
    product.productData,
    config
  );

  return response.data;
};

const deleteproduct = async (id) => {
  const response = await axios.delete(`${base_url}product/${id}`, config);

  return response.data;
};

const getstatus = async (product) => {
  const response = await axios.put(`${base_url}product/status/${product.id}`,{}, config); 
  return response.data;
};
const updateVariantStatus = async (productId, variants) => {
  const response = await axios.put(
    `${base_url}product/${productId}/variants`,
    { variants },
    config
  );
  return response.data;
};

const productService = {
  getProducts,
  createProduct,
  deleteproduct,
  updateProduct,
  getProduct,
  getstatus,
  updateVariantStatus
};

export default productService;
