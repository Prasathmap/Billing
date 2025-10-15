import React, { useEffect, useState } from "react";
import {  Table, Button, Card, Form, Input, Modal, message, Space, Popconfirm,Tooltip,Switch } from "antd";
import {  BiEdit, BiPlusCircle} from "react-icons/bi";
import {  AiOutlineSearch, AiFillDelete } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import * as yup from "yup";
import { useFormik } from "formik";
import {
  createSalestype,
  getASalestype,
  getSalestypes,
  resetState,
  updateSalestype,
  deleteSalestype,
  getstatus,
} from "../../features/salestype/salestypeSlice";

const salestypeSchema = yup.object().shape({
  title: yup.string().required("Salestype is required"),
});

const SalestypeManagement = () => {
  const dispatch = useDispatch();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentSalestypeId, setCurrentSalestypeId] = useState(null);
  const [searchText, setSearchText] = useState("");

  const salestypeState = useSelector((state) => state.salestype);
  const {
    salestypes,
    salestypeName,
    isSuccess,
    isError,
    message: errorMessage ,
    isLoading,
    createdSalestype,
    updatedSalestype,
  } = salestypeState;

 
  const filteredSalestypes = salestypes.filter(salestype => 
    salestype.title.toLowerCase().includes(searchText.toLowerCase())
  );

  useEffect(() => {
    dispatch(getSalestypes());
  }, [dispatch]);

  useEffect(() => {
    if (isSuccess && createdSalestype) {
      message.success("Salestype added successfully!");
      formik.resetForm();
      setIsModalVisible(false);
      dispatch(resetState());
      dispatch(getSalestypes());
    }
    if (isSuccess && updatedSalestype) {
      message.success("Salestype updated successfully!");
      formik.resetForm();
      setIsModalVisible(false);
      dispatch(resetState());
      dispatch(getSalestypes());
    }
    if (isError && errorMessage) {
        message.error(errorMessage);
      }
  }, [isSuccess, isError, isLoading, createdSalestype, updatedSalestype,errorMessage, dispatch]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: salestypeName || "",
    },
    validationSchema: salestypeSchema,
    onSubmit: (values) => {
      if (currentSalestypeId) {
        const data = { id: currentSalestypeId, salestypeData: values };
        dispatch(updateSalestype(data));
      } else {
        dispatch(createSalestype(values));
      }
    },
  });

  const showAddModal = () => {
    setCurrentSalestypeId(null);
    formik.resetForm();
    setIsModalVisible(true);
  };

  const showEditModal = (id) => {
    setCurrentSalestypeId(id);
    dispatch(getASalestype(id));
    setIsModalVisible(true);
  };
const handleToggleStatus = (id) => {
    dispatch(getstatus({ id }))
      .then(() => {
        message.success("Status updated successfully!");
        dispatch(getSalestypes());
      })
      .catch(() => {
        message.error("Failed to update status");
      });
  };
  const handleCancel = () => {
    setIsModalVisible(false);
    formik.resetForm();
  };

  const handleDelete = (id) => {
    dispatch(deleteSalestype(id));
    message.success("deleted successfully!");
    dispatch(getSalestypes());
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "key",
      width: 80,
    },
    {
      title: "Sales Type",
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => (
        <div className="font-medium">{text}</div>
      )
    },
    {
      title: "Status",
      dataIndex: "toggle",
      render: (_, record) => (
        <Switch
        checked={record.status}
          onChange={() => handleToggleStatus(record._id)}
        />
      ),
    },
    {
      title: "Actions",
      dataIndex: "action",
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<BiEdit className=" fs-3 text-primary" />} 
              onClick={() => showEditModal(record._id)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this salestype?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button 
                type="text" 
                danger 
                icon={<AiFillDelete className=" fs-3 text-danger" />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    },
  ];

  const dataSource = filteredSalestypes.map((salestype, index) => ({
    ...salestype,
    key: index + 1,
    name: salestype.title,
    _id: salestype._id
  }));

  return (
    <div>
    <div className="mb-6">
     <h3 className="mb-4 title">Salestype</h3>
   </div>

      <Card 
        title="Salestype" 
        bordered={false} 
        className="shadow-lg"
        extra={
          <Space>
            <Input
              placeholder="Search Salestype..."
              prefix={<AiOutlineSearch />}
              style={{ width: 250 }}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
            <Button 
              type="primary" 
              icon={<BiPlusCircle />}
              onClick={showAddModal}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add Salestype
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={isLoading}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} Salestypes`
          }}
        />
      </Card>

    
      <Modal
        title={currentSalestypeId ? "Edit Sales Type" : "Add New Sales Type"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <Form.Item
            label="Sales Type Name"
            validateStatus={formik.touched.title && formik.errors.title ? "error" : ""}
            help={formik.touched.title && formik.errors.title}
          >
            <Input
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter Salestype name"
            />
          </Form.Item>

          <Form.Item className="text-right">
            <Space>
              <Button onClick={handleCancel}>Cancel</Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {currentSalestypeId ? 'Update' : 'Add'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SalestypeManagement;