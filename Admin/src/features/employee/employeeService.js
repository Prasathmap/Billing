import axios from "axios";
import { config } from "../../utils/axiosconfig";
import { base_url } from "../../utils/baseUrl";
const getEmployees = async () => {
  const response = await axios.get(`${base_url}employee/`, config);

  return response.data;
};

const createEmployee = async (employee) => {
  const response = await axios.post(`${base_url}employee/`, employee, config);

  return response.data;
};
const updateEmployee = async (employee) => {
  const response = await axios.put(
    `${base_url}employee/${employee.id}`,
    { title: employee.employeeData.title,
      empcode: employee.employeeData.empcode,
      phone: employee.employeeData.phone,
     },
    config
  );

  return response.data;
};
const getEmployee = async (id) => {
  const response = await axios.get(`${base_url}employee/${id}`, config);

  return response.data;
};

const deleteEmployee = async (id) => {
  const response = await axios.delete(`${base_url}employee/${id}`, config);

  return response.data;
};

const getstatus = async (employee) => {
  const response = await axios.put(`${base_url}employee/status/${employee.id}`,{}, config); 
  return response.data;
};

const employeeService = {
  getEmployees,
  createEmployee,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  getstatus,
};

export default employeeService;
