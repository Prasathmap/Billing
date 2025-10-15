import axios from "axios";
import { base_url } from "../../utils/baseUrl";
import { config } from "../../utils/axiosconfig";

const getUsers = async () => {
  const response = await axios.get(`${base_url}invoices/sales-report`,config );

  return response.data;
};

const customerService = {
  getUsers,
};

export default customerService;
