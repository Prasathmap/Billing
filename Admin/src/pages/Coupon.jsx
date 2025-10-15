import React, { useEffect, useState } from "react";
import { Table, Button, Card, Form, Input, Modal, message, Space, Tag, DatePicker } from "antd";
import { BiEdit, BiPlusCircle } from "react-icons/bi";
import { AiFillDelete, AiOutlineSearch } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import * as yup from "yup";
import { useFormik } from "formik";
import dayjs from "dayjs";
import {
  createCoupon,
  getACoupon,
  getAllCoupon,
  resetState,
  updateACoupon,
  deleteACoupon,
} from "../features/coupon/couponSlice";

const { RangePicker } = DatePicker;

const couponSchema = yup.object().shape({
  name: yup.string()
    .required("Coupon name is required")
    .min(3, "Coupon name must be at least 3 characters"),
  discount: yup.number()
    .required("Discount percentage is required")
    .min(1, "Discount must be at least 1%")
    .max(100, "Discount cannot exceed 100%"),
  expiry: yup.date()
    .required("Expiry date is required")
    .min(new Date(), "Expiry date must be in the future")
});

const CouponManagement = () => {
  const dispatch = useDispatch();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [currentCouponId, setCurrentCouponId] = useState(null);
  const [couponToDelete, setCouponToDelete] = useState("");
  const [searchText, setSearchText] = useState("");

  const couponState = useSelector((state) => state.coupon);
  const {
    coupons = [],
    isSuccess,
    isError,
    isLoading,
    createdCoupon,
    updatedCoupon,
    couponName,
    couponDiscount,
    couponExpiry
  } = couponState;

  // Filter coupons based on search
  const filteredCoupons = coupons.filter(coupon =>
    coupon.name.toLowerCase().includes(searchText.toLowerCase()) ||
    coupon.discount.toString().includes(searchText)
  );

  useEffect(() => {
    dispatch(getAllCoupon());
  }, [dispatch]);

  useEffect(() => {
    if (isSuccess && createdCoupon) {
      message.success("Coupon added successfully!");
      handleCloseModal();
    }
    if (isSuccess && updatedCoupon) {
      message.success("Coupon updated successfully!");
      handleCloseModal();
    }
    if (isError) {
      message.error("Something went wrong!");
    }
  }, [isSuccess, isError, createdCoupon, updatedCoupon]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: couponName || "",
      discount: couponDiscount || "",
      expiry: couponExpiry ? dayjs(couponExpiry) : ""
    },
    validationSchema: couponSchema,
    onSubmit: (values) => {
      const formattedValues = {
        ...values,
        expiry: values.expiry ? values.expiry.format('YYYY-MM-DD') : ""
      };

      if (currentCouponId) {
        const data = { id: currentCouponId, couponData: formattedValues };
        dispatch(updateACoupon(data));
      } else {
        dispatch(createCoupon(formattedValues));
      }
    },
  });

  const showAddModal = () => {
    setCurrentCouponId(null);
    formik.resetForm();
    setIsModalVisible(true);
  };

  const showEditModal = (id) => {
    setCurrentCouponId(id);
    dispatch(getACoupon(id));
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    formik.resetForm();
    setIsModalVisible(false);
    setCurrentCouponId(null);
    dispatch(resetState());
  };

  const showDeleteModal = (id) => {
    setCouponToDelete(id);
    setDeleteModalVisible(true);
  };

  const handleDelete = () => {
    dispatch(deleteACoupon(couponToDelete));
    setDeleteModalVisible(false);
    message.success("Coupon deleted successfully!");
    dispatch(getAllCoupon());
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
    setCouponToDelete("");
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
      title: "Name",
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => <span className="font-medium">{text}</span>
    },
    {
      title: "Discount",
      dataIndex: "discount",
      sorter: (a, b) => a.discount - b.discount,
      render: (discount) => `${discount}%`
    },
    {
      title: "Expiry",
      dataIndex: "expiry",
      sorter: (a, b) => new Date(a.expiry) - new Date(b.expiry),
      render: (expiry) => dayjs(expiry).format('MMM D, YYYY')
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (_, record) => (
        <Tag color={dayjs(record.expiry).isAfter(dayjs()) ? "green" : "red"}>
          {dayjs(record.expiry).isAfter(dayjs()) ? "Active" : "Expired"}
        </Tag>
      ),
      width: 120
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
            icon={<BiEdit />} 
            onClick={() => showEditModal(record.id)}
            className="text-blue-500"
          />
          <Button 
            type="text" 
            danger 
            icon={<AiFillDelete />} 
            onClick={() => showDeleteModal(record.id)}
          />
        </Space>
      ),
    },
  ];

  const dataSource = filteredCoupons.map((coupon, index) => ({
    key: index + 1,
    id: coupon._id,
    name: coupon.name,
    discount: coupon.discount,
    expiry: coupon.expiry
  }));

  return (
    <div>
    <div className="mb-6">
     <h3 className="mb-4 title">Coupan</h3>
   </div>

      <Card 
        title="Coupons" 
        bordered={false} 
        className="shadow-lg"
        extra={
          <Space>
            <Input
              placeholder="Search coupons..."
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
              Add Coupon
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={isLoading}
          rowKey="id"
          scroll={{ x: 1000 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} coupons`
          }}
        />
      </Card>

      {/* Add/Edit Coupon Modal */}
      <Modal
        title={currentCouponId ? "Edit Coupon" : "Add New Coupon"}
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <Form.Item
            label="Coupon Name"
            validateStatus={formik.touched.name && formik.errors.name ? "error" : ""}
            help={formik.touched.name && formik.errors.name}
          >
            <Input
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter coupon name"
            />
          </Form.Item>
          
          <Form.Item
            label="Discount Percentage"
            validateStatus={formik.touched.discount && formik.errors.discount ? "error" : ""}
            help={formik.touched.discount && formik.errors.discount}
          >
            <Input
              type="number"
              name="discount"
              value={formik.values.discount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter discount percentage"
              addonAfter="%"
            />
          </Form.Item>
          
          <Form.Item
            label="Expiry Date"
            validateStatus={formik.touched.expiry && formik.errors.expiry ? "error" : ""}
            help={formik.touched.expiry && formik.errors.expiry}
          >
            <DatePicker
              name="expiry"
              value={formik.values.expiry}
              onChange={(date) => formik.setFieldValue('expiry', date)}
              onBlur={formik.handleBlur}
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>

          <Form.Item className="text-right">
            <Space>
              <Button onClick={handleCloseModal}>Cancel</Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {currentCouponId ? 'Update' : 'Submit'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Deletion"
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={handleCancelDelete}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete this coupon?</p>
      </Modal>
    </div>
  );
};

export default CouponManagement;