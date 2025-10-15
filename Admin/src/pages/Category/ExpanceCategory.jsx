import React, { useEffect, useState } from "react";
import { Table, Button,Card,Form,Input,Modal,message,Space,Popconfirm,Tooltip,Switch} from "antd";
import { BiEdit, BiPlusCircle} from "react-icons/bi";
import { AiOutlineSearch,AiFillDelete} from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import * as yup from "yup";
import { useFormik } from "formik";
import {
  createExpance,
  getAExpance,
  getExpances,
  resetState,
  updateAExpance,
  deleteAExpance,getstatus
} from "../../features/ecategory/expanceSlice";

const expanceSchema = yup.object().shape({
  title: yup.string().required("Expance Category is required"),
});

const ExpanceManagement = () => {
  const dispatch = useDispatch();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentExpanceId, setCurrentExpanceId] = useState(null);
  const [searchText, setSearchText] = useState("");

  const expanceState = useSelector((state) => state.expance);
  const {
    expances,
    expanceName,
    isSuccess,
    isError,
    isLoading,
    message: errorMessage ,
    createdExpance,
    updatedExpance,
  } = expanceState;

  // Filter expance based on search
  const filteredExpances = expances.filter(expance => 
    expance.title.toLowerCase().includes(searchText.toLowerCase())
  );

  useEffect(() => {
    dispatch(getExpances());
  }, [dispatch]);

  useEffect(() => {
    if (isSuccess && createdExpance) {
      message.success("Expance added successfully!");
      formik.resetForm();
      setIsModalVisible(false);
      dispatch(resetState());
      dispatch(getExpances());
    }
    if (isSuccess && updatedExpance) {
      message.success("Expance updated successfully!");
      formik.resetForm();
      setIsModalVisible(false);
      dispatch(resetState());
      dispatch(getExpances());
    }
    if (isError && errorMessage) {
           message.error(errorMessage);
         }
  }, [isSuccess, isError, isLoading, createdExpance, updatedExpance,errorMessage, dispatch]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: expanceName || "",
    },
    validationSchema: expanceSchema,
    onSubmit: (values) => {
      if (currentExpanceId) {
        const data = { id: currentExpanceId, expanceData: values };
        dispatch(updateAExpance(data));
      } else {
        dispatch(createExpance(values));
      }
    },
  });

  const showAddModal = () => {
    setCurrentExpanceId(null);
    formik.resetForm();
    setIsModalVisible(true);
  };

  const showEditModal = (id) => {
    setCurrentExpanceId(id);
    dispatch(getAExpance(id));
    setIsModalVisible(true);
  };
const handleToggleStatus = (id) => {
    dispatch(getstatus({ id }))
      .then(() => {
        message.success("Status updated successfully!");
        dispatch(getExpances());
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
    dispatch(deleteAExpance(id));
    message.success("deleted successfully!");
    dispatch(getExpances());
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "key",
      width: 80,
    },
    {
      title: "Expance Category",
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
            title="Delete this expance?"
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

  const dataSource = filteredExpances.map((expance, index) => ({
    ...expance,
    key: index + 1,
    name: expance.title,
    _id: expance._id
  }));

  return (
    <div>
    <div className="mb-6">
     <h3 className="mb-4 title">Expances</h3>
   </div>

      <Card 
        title="Expances" 
        bordered={false} 
        className="shadow-lg"
        extra={
          <Space>
            <Input
              placeholder="Search expances..."
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
              Add Expance
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
            showTotal: (total) => `Total ${total} expances`
          }}
        />
      </Card>

      {/* Add/Edit expance Modal */}
      <Modal
        title={currentExpanceId ? "Edit Expance" : "Add New Expance"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <Form.Item
            label="Expance Category"
            validateStatus={formik.touched.title && formik.errors.title ? "error" : ""}
            help={formik.touched.title && formik.errors.title}
          >
            <Input
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter Expance Category"
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
                {currentExpanceId ? 'Update Expance' : 'Add Expance'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ExpanceManagement;