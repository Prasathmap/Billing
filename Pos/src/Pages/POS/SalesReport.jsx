import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  message,
  Row,
  Col,
  Modal,
  Dropdown,
  Checkbox,
} from "antd";
import { BiEdit } from "react-icons/bi";
import { TfiViewGrid, TfiPrinter } from "react-icons/tfi";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getOrders } from "../../features/invoices/invoiceSlice";
import * as XLSX from "xlsx";
import moment from "moment";
import { getProfiles } from "../../features/auth/authSlice";
import generateInvoiceForPrint from "../../components/Printlayout";

const Orders = () => {
  const dispatch = useDispatch();
  const [filteredData, setFilteredData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCartItems, setSelectedCartItems] = useState([]);
  const orderState = useSelector((state) => state?.invoice?.orders || []);
  const profile = useSelector((state) => state?.auth?.profiles || []);

  const [storeProfile, setStoreProfile] = useState({});

  useEffect(() => {
    dispatch(getOrders());
  }, [dispatch]);

  useEffect(() => {
    if (orderState.length > 0) {
      filterData("today");
    }
  }, [orderState]);

  useEffect(() => {
    const fetchProfile = async () => {
      const result = await dispatch(getProfiles()).unwrap();
      setStoreProfile(result);
    };
    fetchProfile();
  }, [dispatch]);

  const filterData = (filterType, customDates = null) => {
    const today = moment();

    const filterByDateRange = (startDate, endDate) => {
      const filtered = orderState.filter((order) =>
        moment(order.createdAt).isBetween(
          moment(startDate).startOf("day"),
          moment(endDate).endOf("day"),
          null,
          "[]"
        )
      );
      setFilteredData(filtered);
    };

    if (filterType === "today") {
      filterByDateRange(today, today);
    } else if (filterType === "custom" && customDates?.length === 2) {
      const [start, end] = customDates;
      filterByDateRange(start, end);
    } else {
      message.warning("Please select a valid date range!");
    }
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
      "Items Count":
        order?.cartCount
          ?.map(
            (method) =>
              `${method?.cartItemsCount || "Unknown"}: ${method?.totalItemsQuantity || 0}`
          )
          .join(", ") || "N/A",
      "Payment Methods":
        order?.paymentMethods
          ?.map((method) => `${method?.method || "Unknown"}: ${method?.amount || 0}`)
          .join(", ") || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(workbook, "Orders_Report.xlsx");
    message.success("Excel file has been downloaded successfully!");
  };

  const parsePaymentMethods = (raw) => {
    if (!raw || typeof raw !== "string") return [];
    return raw.split(",").map((entry) => {
      const [method, amount] = entry.split(":").map((s) => s.trim());
      return {
        method: method || "Unknown",
        amount: parseFloat(amount) || 0,
      };
    });
  };

  const parseCartCount = (raw) => {
    if (!raw || typeof raw !== "string") return [];
    return raw.split(",").map((entry) => {
      const [itemsCount, quantity] = entry.split("/").map((s) => parseInt(s.trim()) || 0);
      return {
        cartItemsCount: itemsCount,
        totalItemsQuantity: quantity,
      };
    });
  };

  const parseGroupedTaxSummary = (raw) => {
    if (!raw || typeof raw !== "string") return [];
    return raw.split(",").map((entry) => {
      const [taxType, amount] = entry.split(":").map((s) => s.trim());
      return {
        taxRate: taxType || "Unknown",
        totalTaxAmount: parseFloat(amount) || 0,
      };
    });
  };

  const handleReprintInvoice = (invoice) => {
    const invoiceData = {
      ...invoice,
      cartItems: invoice.cartItemsList || invoice.cartItems || [],
      cartCount: Array.isArray(invoice.cartCount)
        ? invoice.cartCount
        : parseCartCount(invoice.cartCount),
      subtotal: invoice.subtotal || invoice.subTotal || 0,
      GrandtotalAmount: invoice.GrandtotalAmount || 0,
      remainingBalance: invoice.remainingBalance || 0,
      createdAt: invoice.createdAt || new Date().toISOString(),
      customerName: invoice.customerName !== "N/A" ? invoice.customerName : "",
      customerPhoneNumber: invoice.customerPhoneNumber !== "N/A" ? invoice.customerPhoneNumber : "",
      invoiceno: invoice.invoiceno || "N/A",
      paymentMethods: Array.isArray(invoice.paymentMethods)
        ? invoice.paymentMethods
        : parsePaymentMethods(invoice.paymentMethods),
      groupedTaxSummary: Array.isArray(invoice.groupedTaxSummary)
        ? invoice.groupedTaxSummary
        : parseGroupedTaxSummary(invoice.groupedTaxSummary),
      employee: invoice.employee || "N/A",
      salestype: invoice.salestype || "N/A",
    };
    generateInvoiceForPrint(invoiceData, profile);
  };

  const showCartItemsModal = (cartItems) => {
    setSelectedCartItems(cartItems || []);
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  // All possible columns
  const allColumns = [
    { title: "SNo", dataIndex: "key" },
    { title: "Invoice no", dataIndex: "invoiceno" },
    { title: "Customer Name", dataIndex: "customerName" },
    { title: "Phone Number", dataIndex: "customerPhoneNumber" },
    { title: "Created At", dataIndex: "createdAt" },
    { title: "subTotal", dataIndex: "subTotal" },
    { title: "Total Amount", dataIndex: "GrandtotalAmount" },
    { title: "Balance", dataIndex: "remainingBalance" },
    { title: "Items Count", dataIndex: "cartCount" },
    { title: "SalesType", dataIndex: "salestype" },
    { title: "Payment Methods", dataIndex: "paymentMethods" },
    {
      title: "Cart Items",
      dataIndex: "cartItems",
      render: (_, record) => (
        <Button type="link" className="fs-4 text-primary" onClick={() => showCartItemsModal(record.cartItemsList)}>
          <TfiViewGrid />
        </Button>
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <Link to={`/pos/sales/${record._id}`} className="fs-4 text-primary">
            <BiEdit />
          </Link>
          <Button
            type="text"
            className="fs-4 text-success"
            onClick={() => handleReprintInvoice(record)}
            icon={<TfiPrinter />}
          />
        </div>
      ),
    },
  ];

  // Visible columns state
  const [visibleColumns, setVisibleColumns] = useState(allColumns.map((col) => col.dataIndex));

  const filteredColumns = allColumns.filter((col) => visibleColumns.includes(col.dataIndex));

  const columnSelectorMenu = (
    <div style={{ padding: "10px", maxHeight: "300px", overflowY: "auto",  background:"azure"}}>
      <Checkbox
        checked={visibleColumns.length === allColumns.length}
        onChange={(e) =>
          setVisibleColumns(e.target.checked ? allColumns.map((col) => col.dataIndex) : [])
        }
      >
        Select All
      </Checkbox>
      <div style={{ marginTop: 8 }}>
        {allColumns.map((col) => (
          <div key={col.dataIndex}>
            <Checkbox
              checked={visibleColumns.includes(col.dataIndex)}
              onChange={(e) => {
                const updated = e.target.checked
                  ? [...visibleColumns, col.dataIndex]
                  : visibleColumns.filter((item) => item !== col.dataIndex);
                setVisibleColumns(updated);
              }}
            >
              {col.title}
            </Checkbox>
          </div>
        ))}
      </div>
    </div>
  );

  const dataSource = [...filteredData]
    .sort((a, b) => moment(b.createdAt) - moment(a.createdAt))
    .map((order, index) => ({
      key: index + 1,
      _id: order?._id,
      invoiceno: order?.invoiceno || "N/A",
      customerName: order?.customerName || "N/A",
      customerPhoneNumber: order?.customerPhoneNumber || "N/A",
      createdAt: order?.createdAt ? moment(order.createdAt).format("YYYY-MM-DD HH:mm:ss") : "N/A",
      subTotal: order?.subTotal || 0,
      GrandtotalAmount: order?.GrandtotalAmount || 0,
      remainingBalance: order?.remainingBalance || 0,
      cartCount:
        order?.cartCount
          ?.map((method) => `${method?.cartItemsCount || 0}/ ${method?.totalItemsQuantity || 0}`)
          .join(", ") || "N/A",
      salestype: order?.salestype || "N/A",
      paymentMethods:
        order?.paymentMethods
          ?.map((method) => `${method?.method || "Unknown"}: ${method?.amount || 0}`)
          .join(", ") || "N/A",
      cartItemsList: order?.cartItems || [],
    }));

  return (
    <div>
      <h3 className="mb-4 title">Sales Report</h3>

      <Row gutter={[16, 16]} className="mb-3">
        <Col xs={24} sm={24} md={3}>
          <Button type="primary" block onClick={exportToExcel} disabled={!filteredData.length}>
            Export to Excel
          </Button>
        </Col>
        <Col xs={24} sm={24} md={3}>
          <Dropdown overlay={columnSelectorMenu} trigger={["click"]}>
            <Button block>Select Columns</Button>
          </Dropdown>
        </Col>
      </Row>

      <Table columns={filteredColumns} dataSource={dataSource} scroll={{ x: 1500 }} />

      <Modal
        title="Cart Items"
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={800}
      >
        <Table
          columns={[
            { title: "Product", dataIndex: "title", key: "title" },
            { title: "Quantity", dataIndex: "quantity", key: "quantity" },
            { title: "Price", dataIndex: "price", key: "price" },
          ]}
          dataSource={selectedCartItems.map((item, index) => ({
            key: index,
            title: item?.title || "N/A",
            quantity: item?.quantity || 0,
            price: item?.price || 0,
          }))}
          pagination={false}
        />
      </Modal>
    </div>
  );
};

export default Orders;
