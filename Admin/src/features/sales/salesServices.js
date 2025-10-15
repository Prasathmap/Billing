import axios from "axios";
import { base_url } from "../../utils/baseUrl";
import { config } from "../../utils/axiosconfig";
  
const getOrders = async () => {
  const response = await axios.get(`${base_url}invoices/sales-report`, config );
  return response.data;
};

const getReport = async (data) => {
  const response = await axios.get(`${base_url}invoices/getReport`,data, config );
  return response.data;
};


const invoiceService = {
    getOrders,
    getReport,
   };
  export default invoiceService;
  