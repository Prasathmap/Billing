import React, { useEffect, useState } from "react";
import { Table, Button, Switch, message, Input,Card,Modal, Space } from "antd";
import { AiOutlineSearch } from "react-icons/ai";
import { BiPlusCircle } from "react-icons/bi";
import { BiEdit } from "react-icons/bi";
import { AiFillDelete } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { deleteAProduct, getProducts, getstatus,updateVariantStatus } from "../../features/product/productSlice";
import { Link } from "react-router-dom";
import { delImg } from "../../features/upload/uploadSlice";
import CustomModal from "../../components/CustomModal";


const Productlist = () => {
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const [searchText, setSearchText] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getProducts());
  }, []);

const productState = useSelector((state) => state?.product?.products);
const [isModalOpen, setIsModalOpen] = useState(false);
const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
const [activeRecord, setActiveRecord] = useState(null);
  const showModal = (id) => {
    setOpen(true);
    setProductId(id);
  };

  const hideModal = () => {
    setOpen(false);
  };

  const deleteProduct = (id) => {
    dispatch(deleteAProduct(id));
    dispatch(delImg(id));
    setOpen(false);
    setTimeout(() => {
      dispatch(getProducts());
    }, 100);
  };

  const handleToggleStatus = (id) => {
    dispatch(getstatus({ id: id  }))
      .then(() => {
        message.success("Status updated successfully!");
        dispatch(getProducts());
      })
      .catch(() => {
        message.error("Failed to update status");
      });
  };
const handleVariantStatusChange = (productId, updatedVariants) => {
  dispatch(updateVariantStatus({
    productId: productId,
    variants: updatedVariants,
  }))
  .then(() => {
    message.success("Variant status updated");
    dispatch(getProducts());
  })
  .catch((error) => {
    message.error("Failed to update variant status");
  });
};

  const filteredProducts = productState?.filter((product) =>
    product.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "SNo",
      dataIndex: "key",
      responsive: ["sm"],
    },
    {
      title: "Title",
      dataIndex: "title",
    },
    {
      title: "Brand",
      dataIndex: "brand",
      responsive: ["md"],
    },
    {
      title: "Category",
      dataIndex: "category",
      responsive: ["md"],
    },
    {
      title: "SubCategory",
      dataIndex: "subcategory",
      responsive: ["lg"],
    },
    {
      title: "Unit",
      dataIndex: "unit",
      responsive: ["lg"],
    },
  {
  title: "Status",
  dataIndex: "status",
  render: (_, record) => (
    <div className="flex items-center gap-2">
      <Switch
        checked={record.status}
        onClick={() => {
          if (record.variants?.length > 0) {
            setActiveRecord({
              ...record,
              _id: record.id // Ensure _id is set
            });
            setIsChoiceModalOpen(true);
          } else {
            handleToggleStatus(record.id);
          }
        }}
      />
    </div>
  )
},
    
    {
      title: "Action",
      dataIndex: "action",
    },
  ];

  const data1 = filteredProducts?.map((product, index) => ({
    key: index + 1,
    id: product._id,
    title: product.title,
    brand: product.brand,
    category: product.category,
    subcategory: product.subcategory,
    tax: product.tax,
    unit: product.unit,
    mrp: `${product.mrp}`,
    price: `${product.price}`,
    status: product.status,
    variants: product.variants,
    action: (
      <div className="flex items-center space-x-3">
        
        <Link to={`/admin/update-product/${product._id}`} className=" fs-2 text-primary">
          <BiEdit />
        </Link>
        
        <Button  type="text" danger onClick={() => showModal(product._id)}  icon={<AiFillDelete className=" fs-3 text-danger" />} />
        
      </div>
    ),
  }));

  return (
    <>
<div>
  <div className="mb-6">
    <h3 className="mb-4 title">Products</h3>
  </div>

  <Card
    bordered={false}
    className="shadow-sm"
    extra={
      <Space>
        <Input
          placeholder="Search Product..."
          prefix={<AiOutlineSearch />}
          style={{ width: 200 }}
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Link to="/admin/add-product">
          <Button
            type="primary"
            icon={<BiPlusCircle />}
          >
            Add Product
          </Button>
        </Link>
      </Space>
    }
  >
    <Table
      columns={columns}
      dataSource={data1}
      pagination={{ pageSize: 10, showSizeChanger: true }}
      rowKey="id"
    />
  </Card>

  {/* Delete Modal */}
  <CustomModal
    hideModal={hideModal}
    open={open}
    performAction={() => deleteProduct(productId)}
    title="Are you sure you want to delete this Product?"
  />
</div>
{activeRecord && (
  <Modal
    title="Manage Variant Status"
    open={isModalOpen}
    onCancel={() => {
      setIsModalOpen(false);
      setActiveRecord(null);
    }}
    footer={null}
  >
  <table class="table">
    <tbody>
      {activeRecord.variants?.map((variant, index) => (
        <tr key={index} className="border-b hover:bg-gray-50">
          <td className="py-3 px-5">
            <div className="flex items-center">
              <span className="font-large text-gray-800">
                {variant.variant}
              </span>
              {activeRecord.unit && (
                <span className="text-sm text-gray-500 ml-2">
                  {activeRecord.unit}
                </span>
              )}
            </div>
          </td>
          <td className="py-8 px-8 text-right">
           <Switch
  checked={variant.status}
  onChange={() => { 
    const updatedVariants = activeRecord.variants.map((v, i) =>
      i === index ? { ...v, status: !v.status } : v
    );
    
    handleVariantStatusChange(activeRecord._id, updatedVariants);
    setActiveRecord(prev => ({
      ...prev,
      variants: updatedVariants
    }));
  }}
/>          </td>
        </tr>
      ))}
    </tbody>
  </table>
  </Modal>
)}
<Modal
  title="Manage Product Status"
  open={isChoiceModalOpen}
  onCancel={() => setIsChoiceModalOpen(false)}
  footer={null}
  width={400} // smaller width for compact modal
  centered
>
  <Space direction="vertical" size="large" style={{ display: 'flex' }}>
    <Link
      onClick={() => {
        handleToggleStatus(activeRecord._id);
        setIsChoiceModalOpen(false);
      }}
      style={{
        display: 'block',
        textAlign: 'center',
        padding: '10px 0',
        backgroundColor: '#1890ff',
        color: 'white',
        fontWeight: '600',
        borderRadius: 4,
        userSelect: 'none',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#40a9ff')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1890ff')}
      href="#"
      onClickCapture={e => e.preventDefault()} // prevent default link navigation
    >
      Toggle All Variant Status
    </Link>

    <Link
      onClick={() => {
        setIsChoiceModalOpen(false);
        setIsModalOpen(true);
      }}
      style={{
        display: 'block',
        textAlign: 'center',
        padding: '10px 0',
        backgroundColor: '#f0f0f0',
        color: '#000',
        fontWeight: '600',
        borderRadius: 4,
        userSelect: 'none',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#d9d9d9')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
      href="#"
      onClickCapture={e => e.preventDefault()}
    >
      Manage Variants Individually
    </Link>
  </Space>
</Modal>

</>

  );
};

export default Productlist;
