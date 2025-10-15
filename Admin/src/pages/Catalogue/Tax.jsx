import React, { useEffect, useState } from "react";
import { Table,Button, Card,Form,Input,Modal,message,Tag,Space,Popconfirm,Tooltip,InputNumber,Switch} from "antd";
import { BiEdit,BiPlusCircle } from "react-icons/bi";
import { AiFillDelete, AiOutlineSearch} from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import * as yup from "yup";
import { useFormik } from "formik";
import {
  createTax,
  getATax,
  getTaxs,
  resetState,
  updateATax,
  deleteATax,
  getstatus,
} from "../../features/tax/taxSlice";

const taxSchema = yup.object().shape({
  title: yup
    .number()
    .typeError('Tax must be a number')
    .required("Tax percentage is required")
    .min(0, "Tax cannot be negative")
    .max(100, "Tax cannot exceed 100%"),
});

const TaxManagement = () => {
  const dispatch = useDispatch();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentTaxId, setCurrentTaxId] = useState(null);
  const [searchText, setSearchText] = useState("");

  const taxState = useSelector((state) => state.tax);
  const {
    taxs,
    taxName,
    isSuccess,
    isError,
    message: errorMessage ,
    isLoading,
    createdTax,
    updatedTax,
  } = taxState;

  // Filter taxes based on search
  const filteredTaxs = taxs.filter(tax => 
    tax.title.toString().includes(searchText)
  );

  useEffect(() => {
    dispatch(getTaxs());
  }, [dispatch]);

  useEffect(() => {
    if (isSuccess && createdTax) {
      message.success("Tax added successfully!");
      formik.resetForm();
      setIsModalVisible(false);
      dispatch(resetState());
      dispatch(getTaxs());
    }
    if (isSuccess && updatedTax) {
      message.success("Tax updated successfully!");
      formik.resetForm();
      setIsModalVisible(false);
      dispatch(resetState());
      dispatch(getTaxs());
    }
    if (isError && errorMessage) {
            message.error(errorMessage); // ✅ Display real error message
          }
  }, [isSuccess, isError, isLoading, createdTax, updatedTax,errorMessage, dispatch]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: taxName || 0,
    },
    validationSchema: taxSchema,
    onSubmit: (values) => {
      if (currentTaxId) {
        const data = { id: currentTaxId, taxData: values };
        dispatch(updateATax(data));
      } else {
        dispatch(createTax(values));
      }
    },
  });

  const showAddModal = () => {
    setCurrentTaxId(null);
    formik.resetForm();
    setIsModalVisible(true);
  };

  const showEditModal = (id) => {
    setCurrentTaxId(id);
    dispatch(getATax(id));
    setIsModalVisible(true);
  };
const handleToggleStatus = (id) => {
    dispatch(getstatus({ id }))
      .then(() => {
        message.success("Status updated successfully!");
        dispatch(getTaxs());
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
    dispatch(deleteATax(id));
    message.success("Tax deleted successfully!");
    dispatch(getTaxs());
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "key",
      width: 80,
    },
    {
      title: "Tax Rate",
      dataIndex: "name",
      render: (text) => (
        <Tag color="blue" className="font-bold">
          {text}%
        </Tag>
      ),
      sorter: (a, b) => a.name - b.name,
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
            title="Delete this tax rate?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button 
                type="text" 
                danger 
                icon={<AiFillDelete  className=" fs-3 text-danger"/>}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    },
  ];

  const dataSource = filteredTaxs.map((tax, index) => ({
    ...tax,
    key: index + 1,
    name: tax.title,
    _id: tax._id
  }));

  return (
    <div>
       <div className="mb-6">
        <h3 className="mb-4 title">Tax Rates</h3>
      </div>

      <Card 
        className="mb-4"
        extra={
          <Space>
            <Input
              placeholder="Search..."
              prefix={<AiOutlineSearch />}
              style={{ width: 200 }}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
            <Button 
              type="primary" 
              icon={<BiPlusCircle />}
              onClick={showAddModal}
            >
              Add Tax
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
          }}
        />
      </Card>

      <Modal
        title={currentTaxId ? "Edit Tax Rate" : "Add Tax Rate"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={500}
      >
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <Form.Item
            label="Tax Percentage"
            validateStatus={formik.touched.title && formik.errors.title ? "error" : ""}
            help={formik.touched.title && formik.errors.title}
          >
            <InputNumber
              min={0}
              max={100}
              formatter={value => `${value}%`}
              parser={value => value.replace('%', '')}
              value={formik.values.title}
              onChange={(value) => formik.setFieldValue('title', value)}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isLoading}
              block
            >
              {currentTaxId ? 'Update' : 'Submit'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TaxManagement;