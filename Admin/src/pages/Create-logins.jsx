import React, { useEffect, useState } from "react";
import { Table, Button, Card, Form, Input, Modal, message, Space, Switch,Select  } from "antd";
import { BiEdit, BiPlusCircle } from "react-icons/bi";
import { AiFillDelete, AiOutlineSearch } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import * as yup from "yup";
import { useFormik } from "formik";
import {
  createAttender,
  getAAttender,
  getAttenders,
  resetState,
  updateAAttender,
  deleteAAttender,
  getstatus,
} from "../features/attender/attenderSlice";
const { Option } = Select;

const attenderSchema = yup.object().shape({
  phone: yup.string()
    .required("Phone number is required")
    .matches(/^[0-9]+$/, "Only numbers are allowed")
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number cannot exceed 15 digits"),
    password: yup.string()
    .required("Employee code is required")
    .matches(/^[A-Za-z0-9]+$/, "Only alphanumeric characters allowed"),
    role: yup.string().required("Role is required"),

});

const AttenderManagement = () => {
  const dispatch = useDispatch();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [currentAttenderId, setCurrentAttenderId] = useState(null);
  const [attenderToDelete, setAttenderToDelete] = useState("");
  const [searchText, setSearchText] = useState("");

  const attenderState = useSelector((state) => state.attender);
  const {
    attenders = [],
    isSuccess,
    isError,
    isLoading,
    createdAttender,
    updatedAttender,
    phone,
    password,
    
  } = attenderState;

  // Filter attenders based on search
  const filteredAttenders = attenders.filter(attender =>
    attender.password.toLowerCase().includes(searchText.toLowerCase()) ||
    attender.phone.includes(searchText)
  );

  useEffect(() => {
    dispatch(getAttenders());
  }, [dispatch]);

  useEffect(() => {
    if (isSuccess && createdAttender) {
      message.success("Attender added successfully!");
      handleCloseModal();
      dispatch(getAttenders());
    }
    if (isSuccess && updatedAttender) {
      message.success("Attender updated successfully!");
      handleCloseModal();
      dispatch(getAttenders());
    }
    if (isError) {
      message.error("Something went wrong!");
    }
  }, [isSuccess, isError, createdAttender, updatedAttender, dispatch]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      phone: phone || "",
      password: password || "",
      role: "pos",
    },
    validationSchema: attenderSchema,
    onSubmit: (values) => {
      if (currentAttenderId) {
        const data = { id: currentAttenderId, attenderData: values };
        dispatch(updateAAttender(data));
      } else {
        dispatch(createAttender(values));
      }
    },
  });

  const showAddModal = () => {
    setCurrentAttenderId(null);
    formik.resetForm();
    setIsModalVisible(true);
  };

  const showEditModal = (id) => {
    setCurrentAttenderId(id);
    dispatch(getAAttender(id));
    setIsModalVisible(true);
  };
  const handleToggleStatus = (id) => {
    dispatch(getstatus({ id }))
      .then(() => {
        message.success("Status updated successfully!");
        dispatch(getAttenders());
      })
      .catch(() => {
        message.error("Failed to update status");
      });
  };
  const handleCloseModal = () => {
    formik.resetForm();
    setIsModalVisible(false);
    setCurrentAttenderId(null);
    dispatch(resetState());
  };

  const showDeleteModal = (id) => {
    setAttenderToDelete(id);
    setDeleteModalVisible(true);
  };

  const handleDelete = () => {
    dispatch(deleteAAttender(attenderToDelete));
    setDeleteModalVisible(false);
    message.success("Attender deleted successfully!");
    dispatch(getAttenders());
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
    setAttenderToDelete("");
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "key",
      width: 80,
      fixed: 'left',
      sorter: (a, b) => a.key - b.key
    },
   {
      title: "Phone",
      dataIndex: "phone",
      sorter: (a, b) => a.phone.localeCompare(b.phone),
    },
    {
      title: "Password",
      dataIndex: "password",
      sorter: (a, b) => a.password.localeCompare(b.password),
    },
    {
      title: "Role",
      dataIndex: "role",
      sorter: (a, b) => a.role.localeCompare(b.role),
    },
    
    {
          title: "Status",
          dataIndex: "toggle",
          render: (_, record) => (
            <Switch
              checked={!record.status}
              onChange={() => handleToggleStatus(record.id)}
              />
          ),
        },
    {
      title: "Actions",
      dataIndex: "action",
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<BiEdit  className=" fs-3 text-primary"/>} 
            onClick={() => showEditModal(record.id)}
            className="text-blue-500"
          />
          <Button 
            type="text" 
            danger 
            icon={<AiFillDelete className=" fs-3 text-danger"/>} 
            onClick={() => showDeleteModal(record.id)}
          />
        </Space>
      ),
    },
  ];

  const dataSource = filteredAttenders.map((attender, index) => ({
    key: index + 1,
    id: attender._id,
    phone: attender.phone,
    password: attender.password,
    role: attender.role,
    status: !attender.status,

  }));

  return (
    <div>
    <div className="mb-6">
     <h3 className="mb-4 title">POS Login</h3>
   </div>

      <Card 
        bordered={false}
        className="shadow-sm"
        extra={
          <Space>
            <Input
              placeholder="Search attenders..."
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
              Add Login
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={isLoading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={currentAttenderId ? "Edit Attender" : "Add Attender"}
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={600}
      >
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <Form.Item
            label="Phone Number"
            validateStatus={formik.touched.phone && formik.errors.phone ? "error" : ""}
            help={formik.touched.phone && formik.errors.phone}
          >
            <Input
              name="phone"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter phone number"
            />
          </Form.Item>

          <Form.Item
            label="Password"
            validateStatus={formik.touched.password && formik.errors.password ? "error" : ""}
            help={formik.touched.password && formik.errors.password}
          >
            <Input
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter Password"
            />
          </Form.Item>
          <Form.Item
            label="Role"
            validateStatus={formik.touched.role && formik.errors.role ? "error" : ""}
            help={formik.touched.role && formik.errors.role}
          >
            <Select
              name="role"
              value={formik.values.role}
              onChange={(value) => formik.setFieldValue("role", value)}
              onBlur={formik.handleBlur}
              placeholder="Select Role"
            >
              <Option value="pos">POS</Option>
              <Option value="grn">GRN</Option>
            </Select>
          </Form.Item>


          <Form.Item className="text-right">
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isLoading}
              block
            >
              {currentAttenderId ? 'Update' : 'Submit'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Delete"
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={handleCancelDelete}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete this attender?</p>
      </Modal>
    </div>
  );
};

export default AttenderManagement;