import axios from "axios";
import { base_url } from "../../utils/baseUrl";
import { config } from "../../utils/axiosconfig";


const CreateSale= async (invoiceData) => {
  const response = await axios.post(`${base_url}invoices/`, invoiceData,config);
  return response.data;
};

const updateSales = async (invoice) => {
  const response = await axios.put(
    `${base_url}invoices/${invoice.id}`,
    invoice.invoiceData,
    config
  );
  return response.data;
};
const getASales = async (id) => {
  const response = await axios.get(`${base_url}invoices/${id}`,config);

  return response.data;
};
const Billno= async () => {
  const response = await axios.get(`${base_url}invoices/bill-no`,config);
  return response.data.invoiceno;
};
  
const getOrders = async () => {
  const response = await axios.get(`${base_url}invoices/sales-report`,config );
  return response.data;
};

const getTodayStats = async () => {
    const response = await axios.get(`${base_url}invoices/getReport`, config);
    return response.data;
  };
  
  
const invoiceService = {
    CreateSale,
    updateSales,
    getASales,
    Billno,
    getOrders,
    getTodayStats,
   };
  export default invoiceService;
  