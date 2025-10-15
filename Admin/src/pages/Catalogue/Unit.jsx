import React, { useEffect, useState } from "react";
import { Table, Button,  Card,  Form,  Input,  Modal,Switch,  message, Space, Popconfirm,Tooltip} from "antd";
import {  BiEdit,  BiPlusCircle } from "react-icons/bi";
import {  AiFillDelete,  AiOutlineSearch,} from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { useFormik } from "formik";
import {
  createUnit,
  getAUnit,
  getUnits,
  resetState,
  updateAUnit,
  deleteAUnit,
  getstatus,
} from "../../features/unit/unitSlice";

const unitSchema = yup.object().shape({
  title: yup.string().required("Unit name is required"),
});

const UnitManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentUnitId, setCurrentUnitId] = useState(null);
  const [searchText, setSearchText] = useState("");

  const unitState = useSelector((state) => state.unit);
  const {
    units,
    unitName,
    isSuccess,
    isError,  
    message: errorMessage ,
    isLoading,
    createdUnit,
    updatedUnit,
  } = unitState;

  // Filter units based on search
  const filteredUnits = units.filter(unit => 
    unit.title.toLowerCase().includes(searchText.toLowerCase())
  );

  useEffect(() => {
    dispatch(getUnits());
  }, [dispatch]);

  useEffect(() => {
    if (isSuccess && createdUnit) {
      message.success("Unit added successfully!");
      formik.resetForm();
      setIsModalVisible(false);
      dispatch(resetState());
    }
    if (isSuccess && updatedUnit) {
      message.success("Unit updated successfully!");
      formik.resetForm();
      setIsModalVisible(false);
      dispatch(resetState());
      navigate("/admin/unit");
    }
    if (isError && errorMessage) {
               message.error(errorMessage); // ✅ Display real error message
             }
  }, [isSuccess, isError, isLoading, createdUnit, updatedUnit,errorMessage, dispatch, navigate]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: unitName || "",
    },
    validationSchema: unitSchema,
    onSubmit: (values) => {
      if (currentUnitId) {
        const data = { id: currentUnitId, unitData: values };
        dispatch(updateAUnit(data));
      } else {
        dispatch(createUnit(values));
      }
    },
  });

  const showAddModal = () => {
    setCurrentUnitId(null);
    formik.resetForm();
    setIsModalVisible(true);
  };

  const showEditModal = (id) => {
    setCurrentUnitId(id);
    dispatch(getAUnit(id));
    setIsModalVisible(true);
  };
const handleToggleStatus = (id) => {
    dispatch(getstatus({ id }))
      .then(() => {
        message.success("Status updated successfully!");
        dispatch(getUnits());
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
    dispatch(deleteAUnit(id));
    message.success("Unit deleted successfully!");
    dispatch(getUnits());
  };


  const columns = [
    {
      title: "ID",
      dataIndex: "key",
      width: 80,
      fixed: 'left',
    },
    {
      title: "Unit Name",
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
      width: 150,
      fixed: 'right',
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
            title="Are you sure to delete this unit?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
            placement="left"
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

  const dataSource = filteredUnits.map((unit, index) => ({
    ...unit,
    key: index + 1,
    name: unit.title,
    _id: unit._id
  }));

  return (
    <div>
      <div className="mb-6">
        <h3 className="mb-4 title">Unit Management</h3>
      </div>
      <Card 
        bordered={false} 
        className="shadow-lg"
        extra={
          <Space>
            <Input
              placeholder="Search units..."
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
              Add Unit
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={isLoading}
          rowKey="_id"
          scroll={{ x: 800 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} units`
          }}
        />
      </Card>

      {/* Add/Edit Unit Modal */}
      <Modal
        title={currentUnitId ? "Edit Unit" : "Add New Unit"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form 
          layout="vertical" 
          onFinish={formik.handleSubmit}
          initialValues={formik.initialValues}
        >
          <Form.Item
            label="Unit Name"
            validateStatus={formik.touched.title && formik.errors.title ? "error" : ""}
            help={formik.touched.title && formik.errors.title}
          >
            <Input
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter unit name (e.g., kg, liter, piece)"
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
                {currentUnitId ? 'Update Unit' : 'Add Unit'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UnitManagement;