import React, { useEffect, useState } from "react";
import {  Table, Button, Card, Form, Input, Modal, message,  Space, Popconfirm,Tooltip,Switch } from "antd";
import { BiEdit, BiPlusCircle } from "react-icons/bi";
import { AiOutlineSearch, AiFillDelete } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import * as yup from "yup";
import { useFormik } from "formik";
import {
  createBrand,
  getABrand,
  getBrands,
  resetState,
  updateABrand,
  deleteABrand,
  getstatus,
} from "../../features/brand/brandSlice";

const brandSchema = yup.object().shape({
  title: yup.string().required("Brand name is required"),
});

const BrandManagement = () => {
  const dispatch = useDispatch();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentBrandId, setCurrentBrandId] = useState(null);
  const [searchText, setSearchText] = useState("");

  const brandState = useSelector((state) => state.brand);
  const {
    brands,
    brandName,
    isSuccess,
    isError,
    message: errorMessage ,
    isLoading,
    createdBrand,
    updatedBrand,
  } = brandState;

  // Filter brands based on search
  const filteredBrands = brands.filter(brand => 
    brand.title.toLowerCase().includes(searchText.toLowerCase())
  );

  useEffect(() => {
    dispatch(getBrands());
  }, [dispatch]);

  useEffect(() => {
    if (isSuccess && createdBrand) {
      message.success("Brand added successfully!");
      formik.resetForm();
      setIsModalVisible(false);
      dispatch(resetState());
      dispatch(getBrands());
    }
    if (isSuccess && updatedBrand) {
      message.success("Brand updated successfully!");
      formik.resetForm();
      setIsModalVisible(false);
      dispatch(resetState());
      dispatch(getBrands());
    }
   if (isError && errorMessage) {
    message.error(errorMessage); // ✅ Display real error message
  }
  }, [isSuccess, isError, isLoading, createdBrand, updatedBrand, errorMessage,dispatch]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: brandName || "",
    },
    validationSchema: brandSchema,
    onSubmit: (values) => {
      if (currentBrandId) {
        const data = { id: currentBrandId, brandData: values };
        dispatch(updateABrand(data));
      } else {
        dispatch(createBrand(values));
      }
    },
  });

  const showAddModal = () => {
    setCurrentBrandId(null);
    formik.resetForm();
    setIsModalVisible(true);
  };

  const showEditModal = (id) => {
    setCurrentBrandId(id);
    dispatch(getABrand(id));
    setIsModalVisible(true);
  };
  const handleToggleStatus = (id) => {
    dispatch(getstatus({ id }))
      .then(() => {
        message.success("Status updated successfully!");
        dispatch(getBrands());
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
    dispatch(deleteABrand(id));
    message.success("Brand deleted successfully!");
    dispatch(getBrands());
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "key",
      width: 80,
    },
    {
      title: "Brand Name",
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
          checked={!record.status}
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
            title="Delete this brand?"
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

  const dataSource = filteredBrands.map((brand, index) => ({
    ...brand,
    key: index + 1,
    name: brand.title,
    status: !brand.status,
    _id: brand._id
  }));

  return (
    <div>
    <div className="mb-6">
     <h3 className="mb-4 title">Brands</h3>
   </div>

      <Card 
        title="Brands" 
        bordered={false} 
        className="shadow-lg"
        extra={
          <Space>
            <Input
              placeholder="Search brands..."
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
              Add Brand
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
            showTotal: (total) => `Total ${total} brands`
          }}
        />
      </Card>

      {/* Add/Edit Brand Modal */}
      <Modal
        title={currentBrandId ? "Edit Brand" : "Add New Brand"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <Form.Item
            label="Brand Name"
            validateStatus={formik.touched.title && formik.errors.title ? "error" : ""}
            help={formik.touched.title && formik.errors.title}
          >
            <Input
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter brand name"
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
                {currentBrandId ? 'Update Brand' : 'Add Brand'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BrandManagement;