import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Card,
  Form,
  Input,
  Modal,
  message,
  Space,
  Tooltip,
  Popconfirm,
  Switch,
  Select,
  Tag,
} from "antd";
import { BiEdit, BiPlusCircle, BiTrash } from "react-icons/bi";
import { AiOutlineSearch } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import * as yup from "yup";
import { useFormik } from "formik";
import {
  createSubcategory,
  getSubcategory,
  getSubcategorys,
  updateSubcategory,
  deleteSubcategory,
  getstatus,
  resetState,
} from "../../features/pcategory/subcategorySlice";
import { getCategories } from "../../features/pcategory/pcategorySlice";

const subcategorySchema = yup.object().shape({
  title: yup.string().required("Subcategory name is required"),
  categoryId: yup.string().required("Category selection is required"),
});

const SubCategoryManagement = () => {
  const dispatch = useDispatch();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchText, setSearchText] = useState("");

  const { Option } = Select;

  const { pCategories } = useSelector((state) => state.pCategory);

  // ✅ Correct flat destructuring (no subcatState)
  const {
    subcategories,
    isLoading,
    isError,
    isSuccess,
    message: errorMessage,
    createdSubcategory,
    updatedSubcategory,
    deletedSubacategory,
  } = useSelector((state) => state.subcategory);

  console.log("subcategories →", subcategories);

  // Fetch categories and subcategories on mount
  useEffect(() => {
    dispatch(getCategories());
    dispatch(getSubcategorys());
  }, [dispatch]);

  // Handle success/error updates
  useEffect(() => {
    if (isSuccess && createdSubcategory) {
      message.success("Subcategory added successfully!");
      handleCancel();
      dispatch(resetState());
      dispatch(getSubcategorys());
    }
    if (isSuccess && updatedSubcategory) {
      message.success("Subcategory updated successfully!");
      handleCancel();
      dispatch(resetState());
      dispatch(getSubcategorys());
    }
    if (isSuccess && deletedSubacategory) {
      message.success("Subcategory deleted successfully!");
      dispatch(resetState());
      dispatch(getSubcategorys());
    }
    if (isError && errorMessage) {
      message.error(errorMessage);
    }
  }, [
    isSuccess,
    isError,
    createdSubcategory,
    updatedSubcategory,
    deletedSubacategory,
    errorMessage,
    dispatch,
  ]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: "",
      categoryId: "",
    },
    validationSchema: subcategorySchema,
    onSubmit: (values) => {
      if (currentId) {
        const data = { id: currentId, subcategoryData: values };
        dispatch(updateSubcategory(data));
      } else {
        dispatch(createSubcategory(values));
      }
    },
  });

  const showAddModal = () => {
    setCurrentId(null);
    formik.resetForm();
    setIsModalVisible(true);
  };

  const showEditModal = (id) => {
    setCurrentId(id);
    dispatch(getSubcategory(id)).then((res) => {
      formik.setFieldValue("title", res?.payload?.title || "");
      formik.setFieldValue("categoryId", res?.payload?.categoryId || "");
      setIsModalVisible(true);
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    formik.resetForm();
    setCurrentId(null);
  };

  const handleDelete = (id) => {
    dispatch(deleteSubcategory(id));
  };

  const handleToggleStatus = (id) => {
    dispatch(getstatus({ id }))
      .then(() => {
        message.success("Status updated successfully!");
        dispatch(getSubcategorys());
      })
      .catch(() => {
        message.error("Failed to update status");
      });
  };

  // Filter subcategories by category & search
  const filteredSubcategories = subcategories
    ?.filter((sub) => {
      const matchesCategory = selectedCategory
        ? sub.categoryId === selectedCategory
        : true;
      const matchesSearch = sub.title
        ?.toLowerCase()
        .includes(searchText.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    ?.map((item, index) => ({
      ...item,
      key: index + 1,
    }));

  const columns = [
    {
      title: "ID",
      dataIndex: "key",
      width: 80,
    },
    {
      title: "Subcategory Name",
      dataIndex: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (text) => <div className="font-medium">{text}</div>,
    },
    {
      title: "Category",
      dataIndex: "categoryId",
      render: (categoryId) => {
        const cat = pCategories?.find((c) => c._id === categoryId);
        return <Tag color="blue">{cat?.title || "N/A"}</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
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
              icon={<BiEdit className="fs-3 text-primary" />}
              onClick={() => showEditModal(record._id)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this subcategory?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                danger
                icon={<BiTrash className="fs-3 text-danger" />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h3 className="mb-4 title">Subcategory</h3>
      </div>

      <Card
        title="Subcategories"
        bordered={false}
        className="shadow-lg"
        extra={
          <Space>
            <Select
              placeholder="Select Category"
              style={{ width: 200 }}
              allowClear
              onChange={(value) => setSelectedCategory(value || null)}
            >
              {pCategories?.map((cat) => (
                <Option key={cat._id} value={cat._id}>
                  {cat.title}
                </Option>
              ))}
            </Select>

            <Input
              placeholder="Search subcategories..."
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
              Add Subcategory
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredSubcategories}
          loading={isLoading}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} subcategories`,
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={currentId ? "Edit Subcategory" : "Add New Subcategory"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <Form.Item
            label="Select Category"
            validateStatus={
              formik.touched.categoryId && formik.errors.categoryId
                ? "error"
                : ""
            }
            help={formik.touched.categoryId && formik.errors.categoryId}
          >
            <Select
              name="categoryId"
              placeholder="Select category"
              value={formik.values.categoryId}
              onChange={(value) => formik.setFieldValue("categoryId", value)}
            >
              {pCategories?.map((cat) => (
                <Option key={cat._id} value={cat._id}>
                  {cat.title}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Subcategory Name"
            validateStatus={
              formik.touched.title && formik.errors.title ? "error" : ""
            }
            help={formik.touched.title && formik.errors.title}
          >
            <Input
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter subcategory name"
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
                {currentId ? "Update Subcategory" : "Add Subcategory"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SubCategoryManagement;
