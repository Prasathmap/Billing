import React, { useEffect, useState } from "react";
import { Table, Button, message, DatePicker, Row, Col, Dropdown, Menu } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getOrders } from "../features/sales/salesSlice";
import * as XLSX from "xlsx";
import moment from "moment";

const { RangePicker } = DatePicker;

const Orders = () => {
  const dispatch = useDispatch();
  const [filteredData, setFilteredData] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [dateRange, setDateRange] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const orderState = useSelector((state) => state?.sales?.orders || []);

  useEffect(() => {
    dispatch(getOrders());
  }, [dispatch]);

  useEffect(() => {
    updateDataSource(orderState);
  }, [orderState]);

  const updateDataSource = (data) => {
    const formattedData = data.map((order, index) => ({
      key: index + 1,
      invoiceno: order?.invoiceno || "N/A",
      customerName: order?.customerName || "N/A",
      customerPhoneNumber: order?.customerPhoneNumber || "N/A",
      createdAt: order?.createdAt
        ? moment(order.createdAt).format("YYYY-MM-DD HH:mm:ss")
        : "N/A",
      GrandtotalAmount: order?.GrandtotalAmount || 0,
      cartItemsCount: order?.cartItemsCount || 0,
      paymentMethods: order?.paymentMethods
        ?.map((method) => `${method?.method || "Unknown"}: ${method?.amount || 0}`)
        .join(", ") || "N/A",
    }));
    setDataSource(formattedData);
    setFilteredData(data);
  };

  const handleFilter = (type) => {
    setFilterType(type);
    setShowDatePicker(type === "custom");

    if (!orderState.length) return;

    let filteredOrders = [];
    const now = moment();

    switch (type) {
      case "day":
        filteredOrders = orderState.filter(order => 
          moment(order.createdAt).isBetween(
            now.clone().startOf('day'),
            now.clone().endOf('day'),
            null,
            '[]'
          )
        );
        break;

      case "week":
        filteredOrders = orderState.filter(order => 
          moment(order.createdAt).isBetween(
            now.clone().startOf('week'),
            now.clone().endOf('week'),
            null,
            '[]'
          )
        );
        break;

      case "month":
        filteredOrders = orderState.filter(order => 
          moment(order.createdAt).isBetween(
            now.clone().startOf('month'),
            now.clone().endOf('month'),
            null,
            '[]'
          )
        );
        break;

      case "year":
        filteredOrders = orderState.filter(order => 
          moment(order.createdAt).isBetween(
            now.clone().startOf('year'),
            now.clone().endOf('year'),
            null,
            '[]'
          )
        );
        break;

      case "custom":
        // Don't filter yet, wait for date selection
        return;

      case "all":
      default:
        filteredOrders = orderState;
        break;
    }

    updateDataSource(filteredOrders);
  };
const handleCustomDateChange = (dates) => {
  setDateRange(dates);
  
  if (!dates || dates.length !== 2) {
    message.warning("Please select a valid date range!");
    updateDataSource(orderState);
    return;
  }

  // Get the raw date values without timezones
  const [startDate, endDate] = dates;
  
  // Format dates as simple YYYY-MM-DD strings for comparison
  const startDateStr = startDate.format('YYYY-MM-DD');
  const endDateStr = endDate.format('YYYY-MM-DD');

  const filteredOrders = orderState.filter(order => {
    if (!order.createdAt) return false;
    
    // Format order date as YYYY-MM-DD string
    const orderDateStr = moment(order.createdAt).format('YYYY-MM-DD');
    
    // Simple string comparison for dates
    return orderDateStr >= startDateStr && orderDateStr <= endDateStr;
  }); 
  updateDataSource(filteredOrders);
};

  const exportToExcel = () => {
    if (!filteredData.length) {
      message.warning("No data to export!");
      return;
    }

    const dataToExport = filteredData.map((order, index) => ({
      SNo: index + 1,
      "Invoice No": order?.invoiceno || "N/A",
      "Customer Name": order?.customerName || "N/A",
      "Phone Number": order?.customerPhoneNumber || "N/A",
      "Created At": order?.createdAt
        ? moment(order.createdAt).format("YYYY-MM-DD HH:mm:ss")
        : "N/A",
      "Total Amount": order?.GrandtotalAmount || 0,
      "Items Count": order?.cartItemsCount || 0,
      "Payment Methods": order?.paymentMethods
        ?.map((method) => `${method?.method || "Unknown"}: ${method?.amount || 0}`)
        .join(", ") || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(workbook, "Orders_Report.xlsx");
    message.success("Excel file has been downloaded successfully!");
  };

  const menu = (
    <Menu onClick={({ key }) => handleFilter(key)}>
      <Menu.Item key="day">Today</Menu.Item>
      <Menu.Item key="week">This Week</Menu.Item>
      <Menu.Item key="month">This Month</Menu.Item>
      <Menu.Item key="year">This Year</Menu.Item>
      <Menu.Item key="custom">Custom Range</Menu.Item>
      <Menu.Item key="all">All Time</Menu.Item>
    </Menu>
  );

  const columns = [
    { title: "SNo", dataIndex: "key" },
    { title: "Invoice no", dataIndex: "invoiceno" },
    { title: "Customer Name", dataIndex: "customerName" },
    { title: "Phone Number", dataIndex: "customerPhoneNumber" },
    { title: "Created At", dataIndex: "createdAt" },
    { title: "Total Amount", dataIndex: "GrandtotalAmount" },
    { title: "Items Count", dataIndex: "cartItemsCount" },
    { title: "Payment Methods", dataIndex: "paymentMethods" },
  ];

  return (
    <div>
      <h3 className="mb-4 title">Orders</h3>
      <div className="mb-3">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Dropdown overlay={menu} trigger={['click']}>
              <Button>
                {filterType === 'day' && 'Today'}
                {filterType === 'week' && 'This Week'}
                {filterType === 'month' && 'This Month'}
                {filterType === 'year' && 'This Year'}
                {filterType === 'custom' && 'Custom Range'}
                {filterType === 'all' && 'All Time'}
                {!filterType && 'Filter by'}
              </Button>
            </Dropdown>
          </Col>
          <Col xs={24} sm={12} md={12}>
            {showDatePicker && (
              <RangePicker
                className="w-100"
                onChange={handleCustomDateChange}
                value={dateRange}
                allowClear={true}
              />
            )}
          </Col>
          <Col xs={24} sm={24} md={6}>
            <Button
              type="primary"
              block
              onClick={exportToExcel}
              disabled={!filteredData.length}
            >
              Export to Excel
            </Button>
          </Col>
        </Row>
      </div>
      <Table
        columns={columns}
        dataSource={dataSource}
        scroll={{ x: 800 }}
      />
    </div>
  );
};

export default Orders;