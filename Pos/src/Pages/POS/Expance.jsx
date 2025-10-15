import React, { useEffect, useState } from "react";
import { Form, InputNumber, Select, Button, Card, Table, message,Row, Col,Tooltip } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  createExpance,
  getAExpance,
  resetState,
  updateAExpance,
  getExpances,
  getExpancecat,
} from "../../features/expance/expanceSlice";

const { Option } = Select;

const paymentMethods = ["Cash", "CreditCard", "OnlinePay", "Rupay"];

const AddExpance = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const expanceId = location.pathname.split("/")[3];
  
  const { isSuccess, isError, isLoading, expanceData, expances,expenseCategories} = useSelector(
    (state) => state.expance
  );
  const [editingId, setEditingId] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    dispatch(getExpancecat());
    if (expanceId) {
      dispatch(getAExpance(expanceId));
    } else {
      dispatch(resetState());
    }
    dispatch(getExpances());
  }, [dispatch, expanceId]);

  useEffect(() => {
    console.log("Fetched Expenses:", expances);
  }, [expances]);
  const today = new Date().toISOString().split("T")[0];

  const todayExpenses = expances?.filter((exp) =>
    exp?.createdAt?.split("T")[0] === today
  );
  


  useEffect(() => {
    if (expanceId && expanceData) {
      form.setFieldsValue({
        category: expanceData.category,
        amount: expanceData.amount,
        paymentMethod: expanceData.paymentMethod,
      });
      setSelectedCategory(expanceData.category);
    }
  }, [expanceData, expanceId, form]);

  useEffect(() => {
    if (isSuccess) {
      message.success(expanceId ? "Expense updated successfully!" : "Expense added successfully!");
      navigate("/Pos/Expance");
    }
    if (isError) {
      message.error("Something went wrong!");
    }
  }, [isSuccess, isError, isLoading]);
  

  const onFinish = (values) => {
    if (editingId) {
      dispatch(updateAExpance({ id: editingId, data: values }))
        .then(() => {
          message.success("Expense updated successfully!");
          setEditingId(null);
          form.resetFields();
          dispatch(getExpances());
        });
    } else {
      dispatch(createExpance(values))
        .then(() => {
          message.success("Expense added successfully!");
          form.resetFields();
          dispatch(getExpances());
        });
    }
  };
  
  const handleEdit = (record) => {
    form.setFieldsValue({
      category: record.category,
      amount: record.amount,
      paymentMethod: record.paymentMethod,
    });
    setSelectedCategory(record.category);
    setEditingId(record._id); // Save which record is being edited
  };
  
  const columns = [
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category) => {
        const cat = expenseCategories?.find(c => c._id === category);
        return cat?.title || category;
      },
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => `₹${amount}`,
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (method) => paymentMethods.find(m => m.valueOf === method)?.label || method,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "12px" }}>
          <Tooltip title="Edit">
            <Button
              type="link"
              onClick={() => handleEdit(record)}
            >
              ✏️
            </Button>
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="link"
              danger
              onClick={() => handleDelete(record._id)}
            >
              🗑️
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];
  
  return (
<div style={{ padding: "24px" }}>
  <Row gutter={[24, 24]}>
    {/* Add/Edit Expense Card - 50% on md and up, 100% on xs */}
    <Col xs={24} md={12}>
      <Card title={expanceId ? "Edit Expense" : "Add Expense"} bordered={false}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: "Please select a category" }]}
          >
            <Select
              placeholder="Select expense category"
              onChange={setSelectedCategory}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {expenseCategories?.map((category) => (
                category.status ?(
                <Option key={category._id} value={category._id}>
                  {category.title}
                </Option>):null
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="amount"
            label="Amount"
            rules={[
              { required: true, message: "Please enter the amount" },
              { type: "number", min: 0.01, message: "Amount must be greater than 0" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0.01}
              step={0.01}
              placeholder="0.00"
              formatter={(value) =>
                `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/₹\s?|(,*)/g, "")}
            />
          </Form.Item>

          <Form.Item
            name="paymentMethod"
            label="Payment Method"
            rules={[{ required: true, message: "Please select a payment method" }]}
          >
            <Select placeholder="Select payment method">
            {paymentMethods.map((method) => (
                          <option key={method} value={method}>
                            {method}
                          </option>
                        ))}
            </Select>
          </Form.Item>

          <div style={{ textAlign: "right" }}>
            <Button onClick={() => navigate("/Pos/Expance")} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              {expanceId ? "Update" : "Save"}
            </Button>
          </div>
        </Form>
      </Card>
    </Col>

    {/* Expense List Card - 50% on md and up, 100% on xs */}
    <Col xs={24} md={12}>
      <Card title="Expense List" bordered={false}>
        <Table
          columns={columns}
          dataSource={todayExpenses}
          rowKey="_id"
          pagination={{ pageSize: 5 }}
          loading={isLoading}
          scroll={{ x: true }}
        />
      </Card>
    </Col>
  </Row>
</div>
  );
};

export default AddExpance;