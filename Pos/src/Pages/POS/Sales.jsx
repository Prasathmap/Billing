import { useEffect, useState } from "react";
import { 
  Card, 
  Button, 
  List, 
  Input, 
  Row, 
  Col, 
  Typography, 
  Form, 
  message, 
  Modal, 
  Table, 
  Tooltip, 
  Tag, 
  Space,
  Badge,
  Divider,
  Statistic,
  Avatar,
  Select,
  InputNumber,
  Grid,
  Descriptions,
  FloatButton
} from "antd";
import { 
  DeleteOutlined, 
  PlusOutlined, 
  MinusOutlined, 
  SearchOutlined, 
  SaveOutlined, 
  HistoryOutlined,
  ShoppingCartOutlined,
  UserAddOutlined,
  ReloadOutlined,
  PauseOutlined,
  CalculatorOutlined,
  BarcodeOutlined,
  CreditCardOutlined,
  DollarOutlined,
  GlobalOutlined,
  WalletOutlined
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import { getProducts, getCategories, getSalestypes } from "../../features/sales/salesSlice";
import { addProduct, decrease, increase, deleteProduct, updateQuantity, setCart, resetState } from "../../features/cart/cartSlice";
import { getProfiles } from "../../features/auth/authSlice";
import { CreateSale, Billno, updateSales, getASales } from "../../features/invoices/invoiceSlice";
import generateInvoiceForPrint from "../../components/Printlayout";
import moment from "moment";
import { useNavigate, useParams } from "react-router-dom";

const { Text, Title } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

const ModernPOS = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const screens = useBreakpoint();
  
  const [paymentAmounts, setPaymentAmounts] = useState({});
  const [paymentDetails, setPaymentDetails] = useState({
    originalExpectedTotal: 0,
    expectedTotal: 0,
    cashPayment: 0,
    otherPayment: 0,
    balance: 0,
    overpaymentAllowed: false,
  });
  
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [tempPaymentAmount, setTempPaymentAmount] = useState("");

  const paymentMethods = [
    { 
      value: "Cash", 
      label: "Cash", 
      icon: <DollarOutlined />, 
      color: "#52c41a",
      quickAmounts: [100, 500, 1000, 2000]
    },
    { 
      value: "CreditCard", 
      label: "Credit Card", 
      icon: <CreditCardOutlined />, 
      color: "#1890ff",
      quickAmounts: []
    },
    { 
      value: "OnlinePay", 
      label: "Online Pay", 
      icon: <GlobalOutlined />, 
      color: "#722ed1",
      quickAmounts: []
    }
  ];

  const [heldBills, setHeldBills] = useState([]);
  const [isHeldBillsModalVisible, setIsHeldBillsModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Access state from Redux store
  const products = useSelector((state) => state.sales.products);
  const categories = useSelector((state) => state.sales.pCategories);
  const invoiceno = useSelector((state) => state.invoice.invoiceno);
  const cart = useSelector((state) => state.cart.items) || [];
  const salestype = useSelector((state) => state?.sales?.salestypes || []);
  const profile = useSelector((state) => state?.auth?.profiles || []);

  // Calculate totals
  const subtotalRaw = cart?.reduce((sum, item) => sum + (item.mrp || 0) * (item.quantity || 1), 0) || 0;
  const totalTaxRaw = cart?.reduce((sum, item) => sum + (item.taxprice || 0) * (item.quantity || 1), 0) || 0;
  const subtotal = subtotalRaw.toFixed(2);
  const totalTax = totalTaxRaw.toFixed(2);
  const roundOff = (subtotalRaw + totalTaxRaw).toFixed(2);
  const finalTotal = Math.ceil(subtotalRaw + totalTaxRaw).toFixed(2);
  const roundOffamount = (parseFloat(finalTotal) - parseFloat(roundOff)).toFixed(2);
  const totalItemsQuantity = cart?.reduce((total, item) => total + (item.quantity || 1), 0) || 0;
  const cartItemsCount = cart?.length || 0;

  // Calculate total paid amount
  const totalPaid = Object.values(paymentAmounts).reduce((sum, amount) => sum + (parseFloat(amount) || 0), 0);

  // Load single invoice when editing
  useEffect(() => {
    if (!id) {
      dispatch(resetState());
      dispatch(Billno());
      return;
    }

    setIsLoading(true);
    dispatch(getASales(id))
      .unwrap()
      .then((invoice) => {
        formik.setValues({
          customerName: invoice.customerName,
          customerPhoneNumber: invoice.customerPhoneNumber,
          amount_Cash: invoice.paymentMethods.find(pm => pm.method === "Cash")?.amount || "",
          amount_CreditCard: invoice.paymentMethods.find(pm => pm.method === "CreditCard")?.amount || "",
          amount_OnlinePay: invoice.paymentMethods.find(pm => pm.method === "OnlinePay")?.amount || "",
          invoiceno: invoice.invoiceno,
        });

        const paymentAmounts = {};
        invoice.paymentMethods.forEach(pm => {
          paymentAmounts[pm.method] = pm.amount;
        });
        setPaymentAmounts(paymentAmounts);

        dispatch(setCart(invoice.cartItems.map(item => ({
          ...item,
          _id: item.product
        }))));
      })
      .catch((error) => {
        message.error(error.message || "Failed to load invoice");
      })
      .finally(() => setIsLoading(false));
  }, [id, dispatch]);

  // Load initial data
  useEffect(() => {
    dispatch(getProducts());
    dispatch(getCategories());
    dispatch(getSalestypes());
    dispatch(getProfiles());

    const savedHeldBills = localStorage.getItem('heldBills');
    if (savedHeldBills) {
      setHeldBills(JSON.parse(savedHeldBills));
    }
  }, [dispatch]);

  // Set default category
  useEffect(() => {
    if (categories.length > 0) {
      setSelectedCategory(categories[0]._id);
    }
  }, [categories]);

  // Calculate payment details
  const calculateTotalPayment = () => {
    const totalEnteredPayment = totalPaid;
    const cashPayment = parseFloat(paymentAmounts.Cash) || 0;
    const otherPayment = totalEnteredPayment - cashPayment;

    const originalExpectedTotal = parseFloat(finalTotal) || 0;
    const expectedTotal = Math.ceil(originalExpectedTotal);
    const balance = expectedTotal - totalEnteredPayment;

    let overpaymentAllowed = false;
    if (balance < 0 && cashPayment + balance >= -500 && otherPayment === 0) {
      overpaymentAllowed = true;
    }

    setPaymentDetails({
      originalExpectedTotal,
      expectedTotal,
      cashPayment,
      otherPayment,
      balance,
      overpaymentAllowed,
    });
  };

  useEffect(() => {
    calculateTotalPayment();
  }, [paymentAmounts, finalTotal]);

  // Handle payment method selection
  const handlePaymentMethodClick = (method) => {
    setSelectedPaymentMethod(method);
    setTempPaymentAmount(paymentAmounts[method.value] || "");
    setIsPaymentModalVisible(true);
  };

  // Confirm payment amount
  const confirmPaymentAmount = () => {
    if (!tempPaymentAmount || parseFloat(tempPaymentAmount) < 0) {
      message.error("Please enter a valid amount");
      return;
    }

    setPaymentAmounts(prev => ({
      ...prev,
      [selectedPaymentMethod.value]: tempPaymentAmount
    }));

    formik.setFieldValue(`amount_${selectedPaymentMethod.value}`, tempPaymentAmount);
    setIsPaymentModalVisible(false);
    message.success(`${selectedPaymentMethod.label} payment added: ₹${tempPaymentAmount}`);
  };

  // Remove payment method
  const removePaymentMethod = (methodValue) => {
    setPaymentAmounts(prev => {
      const newAmounts = { ...prev };
      delete newAmounts[methodValue];
      return newAmounts;
    });

    formik.setFieldValue(`amount_${methodValue}`, "");
    message.success("Payment method removed");
  };

  // Quick amount selection
  const handleQuickAmount = (amount) => {
    setTempPaymentAmount(amount.toString());
  };

  // Auto-fill remaining amount
  const handleAutoFill = () => {
    const remaining = parseFloat(finalTotal) - totalPaid;
    if (remaining > 0) {
      setTempPaymentAmount(remaining.toFixed(2));
    }
  };

  // Hold current bill
  const holdCurrentBill = () => {
    if (cart.length === 0) {
      message.warning("Cannot hold an empty bill");
      return;
    }

    const newHeldBill = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      cartItems: [...cart],
      formValues: { ...formik.values },
      subtotal,
      totalTax,
      finalTotal,
      totalItemsQuantity,
      cartItemsCount
    };

    const updatedHeldBills = [...heldBills, newHeldBill];
    setHeldBills(updatedHeldBills);
    localStorage.setItem('heldBills', JSON.stringify(updatedHeldBills));
    message.success("Bill held successfully");
    dispatch(resetState());
    formik.resetForm();
    setPaymentAmounts({});
  };

  // Retrieve held bill
  const retrieveHeldBill = (billId) => {
    const billToRetrieve = heldBills.find(bill => bill.id === billId);
    if (!billToRetrieve) return;
    dispatch(setCart(billToRetrieve.cartItems));
    formik.setValues(billToRetrieve.formValues);
    setIsHeldBillsModalVisible(false);
    message.success("Bill retrieved successfully");
  };

  // Delete held bill
  const deleteHeldBill = (billId) => {
    const updatedHeldBills = heldBills.filter(bill => bill.id !== billId);
    setHeldBills(updatedHeldBills);
    localStorage.setItem('heldBills', JSON.stringify(updatedHeldBills));
    message.success("Held bill deleted");
  };

  // Clear all held bills
  const clearAllHeldBills = () => {
    setHeldBills([]);
    localStorage.removeItem('heldBills');
    message.success("All held bills cleared");
  };

  // Formik setup
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      customerName: "",
      customerPhoneNumber: "",
      amount_Cash: "",
      amount_CreditCard: "",
      amount_OnlinePay: "",
    },
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        const paymentMethods = Object.entries(paymentAmounts)
          .filter(([_, amount]) => amount && parseFloat(amount) > 0)
          .map(([method, amount]) => ({
            method,
            amount: parseFloat(amount)
          }));

        // Prepare invoice data
        const invoiceData = {
          ...(id ? {} : { invoiceno }),
          customerName: values.customerName,
          customerPhoneNumber: values.customerPhoneNumber,
          salestype: salestype.find(stype => stype.status)?.title || "",
          paymentMethods,
          cartItems: cart.map((item) => ({
            product: item._id,
            title: item.title,
            variant: item.variant,
            unit: item.unit,
            quantity: item.quantity,
            mrp: item.mrp,
            price: item.price,
            tax: item.tax,
            taxprice: item.taxprice,
            cgst: item.cgst,
            cgstprice: item.cgstprice,
            sgst: item.sgst,
            sgstprice: item.sgstprice,
          })),
          cartCount: [{ cartItemsCount, totalItemsQuantity }],
          groupedTaxSummary: [],
          subTotal: subtotal,
          taxprice: totalTax,
          discount: 0,
          remainingBalance: paymentDetails.balance,
          roundOffamount: roundOffamount,
          GrandtotalAmount: finalTotal,
        };

        if (id) {
          try {
            await dispatch(updateSales({ id, invoiceData })).unwrap();
            message.success("Invoice updated successfully");
            generateInvoiceForPrint(invoiceData, profile);
            navigate("/pos/sales-Report");
          } catch (error) {
            if (error?.response?.data?.message?.includes("already been updated")) {
              alert("This invoice has already been updated and cannot be modified again.");
              navigate("/pos/sales-Report");
            } else {
              message.error(error.message || "Failed to update invoice");
            }
          }
        } else {
          await dispatch(CreateSale(invoiceData)).unwrap();
          message.success("Invoice created successfully");
          generateInvoiceForPrint(invoiceData, profile);
          formik.resetForm();
          dispatch(resetState());
          dispatch(Billno());
          setPaymentAmounts({});
        }
      } catch (error) {
        message.error(error.message || "An error occurred");
      } finally {
        setIsLoading(false);
      }
    },
  });

  // Handle category selection
  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  // Handle product addition
  const handleAddProduct = (product) => {
    if (product.status) {
      dispatch(addProduct(product));
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    const quantity = parseInt(newQuantity, 10);
    if (!isNaN(quantity)) {
      dispatch(updateQuantity({ id: itemId, quantity }));
    }
  };

  // Create category map
  const categoryMap = {};
  categories.forEach((category) => {
    categoryMap[category.title] = category._id;
  });

  // Filter products
  const filteredProducts = selectedCategory
    ? products.filter(
        (product) =>
          categoryMap[product.category] === selectedCategory &&
          product.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Columns for held bills table
  const heldBillsColumns = [
    {
      title: 'Date/Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => moment(timestamp).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
    },
    {
      title: 'Customer',
      dataIndex: 'formValues',
      key: 'customer',
      render: (formValues) => formValues.customerName || 'Walk-in Customer',
    },
    {
      title: 'Items',
      dataIndex: 'cartItemsCount',
      key: 'items',
      render: (count) => <Badge count={count} showZero />,
    },
    {
      title: 'Total',
      dataIndex: 'finalTotal',
      key: 'total',
      render: (total) => `₹${parseFloat(total).toFixed(2)}`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            size="small" 
            onClick={() => retrieveHeldBill(record.id)}
          >
            Retrieve
          </Button>
          <Button 
            danger 
            size="small" 
            onClick={() => deleteHeldBill(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: '#f5f5f5', }}>
      <Row gutter={[16, 16]}>
        {/* Categories Section - Left Sidebar */}
  <Col xs={24} sm={24} md={6} lg={4}>
    <Card 
      style={{ 
        height: screens.md ? 'calc(100vh - 32px)' : 'auto',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}
      bodyStyle={{ padding: screens.md ? '12px' : '8px' }}
    >
      
      {/* Vertical layout for desktop, horizontal scroll for mobile */}
      <div style={{ 
        maxHeight: screens.md ? 'calc(100vh - 120px)' : 'auto',
        overflow: screens.md ? 'auto' : 'visible',
        display: screens.md ? 'block' : 'flex',
        flexWrap: 'nowrap',
        overflowX: screens.md ? 'hidden' : 'auto',
        gap: '8px',
        padding: screens.md ? '0' : '4px 0'
      }}>
        {categories.map((cat) => (
          cat.status && (
            <div
              key={cat._id}
              onClick={() => handleCategoryClick(cat._id)}
              style={{
                padding: screens.md ? '12px 16px' : '8px 16px',
                margin: screens.md ? '4px 0' : '0 4px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                background: selectedCategory === cat._id ? '#1890ff' : 'transparent',
                color: selectedCategory === cat._id ? 'white' : '#333',
                border: selectedCategory === cat._id ? 'none' : '1px solid #f0f0f0',
                flex: screens.md ? 'none' : '0 0 auto',
                whiteSpace: 'nowrap',
                textAlign: screens.md ? 'left' : 'center'
              }}
              className="category-item"
            >
              <Text 
                strong 
                style={{ 
                  color: selectedCategory === cat._id ? 'white' : 'inherit',
                  fontSize: screens.md ? '14px' : '13px'
                }}
              >
                {cat.title}
              </Text>
            </div>
          )
        ))}
      </div>
    </Card>
  </Col>

        {/* Products Section - Middle */}
        <Col xs={24} sm={16} md={12} lg={13}>
          <Card
            style={{
              height: screens.xs ? 'auto' : 'calc(100vh - 32px)',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
            bodyStyle={{ padding: '16px' }}
          >
            {/* Search Bar */}
            <div style={{ marginBottom: '24px' }}>
              <Input
                placeholder="🔍 Search products..."
                prefix={<SearchOutlined />}
                size="large"
                value={searchTerm}
                onChange={handleSearch}
                allowClear
                style={{
                  borderRadius: '8px',
                  border: '2px solid #f0f0f0',
                  transition: 'all 0.3s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1890ff';
                  e.target.style.boxShadow = '0 0 0 2px rgba(24, 144, 255, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#f0f0f0';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Products Grid */}
            <div style={{ 
              maxHeight: screens.xs ? '400px' : 'calc(100vh - 200px)', 
              overflow: 'auto',
              paddingRight: '8px'
            }}>
              <Row gutter={[12, 12]}>
                {filteredProducts.flatMap((item) =>
                  item.variants.map((variant, index) => (
                    <Col key={`${item._id}-${index}`} xs={12} sm={8} md={6} lg={6}>
                      <Card
                        hoverable
                        onClick={() => handleAddProduct({ 
                          ...item, 
                          ...variant,
                          price: variant.price, 
                          mrp: variant.mrp, 
                          selectedVariant: variant 
                        })}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #1b1d8fff',
                          transition: 'all 0.3s',
                        }}
                        bodyStyle={{
                          padding: '12px',
                          textAlign: 'center'
                        }}
                      >
                        <Text strong style={{ display: 'block', marginBottom: '4px' }}>
                          {item.title}
                        </Text>
                        
                        <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                          {variant.variant}{item.unit}
                        </Text>
                        
                        <div style={{ 
                          background: '#f6ffed', 
                          padding: '4px 8px', 
                          borderRadius: '4px',
                          border: '1px solid #b7eb8f'
                        }}>
                          <Text strong style={{ color: '#52c41a', fontSize: '14px' }}>
                            ₹{variant.price.toFixed(2)}
                          </Text>
                        </div>
                      </Card>
                    </Col>
                  ))
                )}
              </Row>
            </div>
          </Card>
        </Col>

        {/* Cart Section - Right Sidebar */}
        <Col xs={24} sm={24} md={6} lg={7}>
          <Card
            style={{
              height: screens.xs ? 'auto' : 'calc(100vh - 32px)',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <ShoppingCartOutlined style={{ color: '#1890ff' }} />
                  <Text strong>Current Order</Text>
                  <Badge count={cartItemsCount} showZero style={{ backgroundColor: '#52c41a' }} />
                </Space>
                <Tag color="purple">#{formik.values.invoiceno || invoiceno}</Tag>
              </div>
            }
          >
            <Form layout="vertical" onFinish={formik.handleSubmit}>
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {/* Customer Details */}
                <Card size="small" title="Customer Details">
                  <Space direction="herizontal" style={{ width: '100%' }}>
                    <Input
                      placeholder="Customer Name"
                      name="customerName"
                      value={formik.values.customerName}
                      onChange={formik.handleChange}
                      prefix={<UserAddOutlined />}
                    />
                    <Input
                      placeholder="Phone Number"
                      name="customerPhoneNumber"
                      value={formik.values.customerPhoneNumber}
                      onChange={formik.handleChange}
                    />
                  </Space>
                </Card>

                 {/* Cart Items */}
                <Card size="small">
                  <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                    <List
                      dataSource={cart}
                      renderItem={(item) => (
                        <List.Item
                          actions={[
                            <Button 
                              icon={<MinusOutlined />} 
                              size="small" 
                              onClick={() => dispatch(decrease(item._id))}
                            />,
                            <InputNumber
                              size="small"
                              value={item.quantity}
                              onChange={(value) => handleQuantityChange(item._id, value)}
                              min={1}
                              style={{ width: '60px' }}
                            />,
                            <Button 
                              icon={<PlusOutlined />} 
                              size="small" 
                              onClick={() => dispatch(increase(item._id))}
                            />,
                            <Button 
                              icon={<DeleteOutlined />} 
                              size="small" 
                              danger 
                              onClick={() => dispatch(deleteProduct(item._id))}
                            />,
                          ]}
                        >
                          <List.Item.Meta
                            title={<Text ellipsis>{item.title}</Text>}
                            description={
                              <Space>
                                <Text>₹{item.price.toFixed(2)}</Text>
                                <Text type="secondary">x{item.quantity}</Text>
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                      locale={{ emptyText: 'No items in cart' }}
                    />
                  </div>
                </Card>
               {/* Order Summary */}
                <Card size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Subtotal:</Text>
                      <Text strong>₹{subtotal}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Tax:</Text>
                      <Text strong>₹{totalTax}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Items:</Text>
                      <Text strong>{totalItemsQuantity}</Text>
                    </div>
                    <Divider style={{ margin: '8px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text strong style={{ fontSize: '16px' }}>Total:</Text>
                      <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                        ₹{finalTotal}
                      </Text>
                    </div>
                  </Space>
                </Card>

                {/* Payment Methods Dashboard */}
              <Card size="small">
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  {/* Single Line Payment Method Buttons */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {paymentMethods.map((method) => {
                      const amount = paymentAmounts[method.value];
                      const isSelected = !!amount;
                      
                      return (
                        <Button
                          key={method.value}
                          type={isSelected ? "primary" : "default"}
                          icon={method.icon}
                          onClick={() => handlePaymentMethodClick(method)}
                          style={{
                            flex: '1',
                            minWidth: '120px',
                            height: '48px',
                            border: `2px solid ${isSelected ? method.color : '#d9d9d9'}`,
                            background: isSelected ? method.color : 'white',
                            color: isSelected ? 'white' : method.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontWeight: 'bold',
                            position: 'relative',
                            padding: '0 12px'
                          }}
                        >
                          <span>{method.label}</span>
                          {isSelected && (
                            <Badge 
                              count={`₹${parseFloat(amount).toFixed(0)}`} 
                              style={{ 
                                backgroundColor: 'white', 
                                color: method.color,
                                fontWeight: 'bold',
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                fontSize: '10px',
                                padding: '0 4px',
                                height: '16px',
                                lineHeight: '16px',
                                minWidth: '16px'
                              }} 
                            />
                          )}
                        </Button>
                      );
                    })}
                  </div>

                  {/* Payment Summary - Compact Version */}
                  {totalPaid > 0 && (
                    <div style={{ 
                      background: '#f6ffed', 
                      padding: '8px 12px', 
                      borderRadius: '6px',
                      border: '1px solid #b7eb8f',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Space>
                        <Text strong>Paid:</Text>
                        <Text strong style={{ color: '#52c41a', fontSize: '14px' }}>
                          ₹{totalPaid.toFixed(2)}
                        </Text>
                      </Space>
                      <Space>
                        <Text>Balance:</Text>
                        <Text strong type={paymentDetails.balance > 0 ? "danger" : "success"}>
                          ₹{paymentDetails.balance.toFixed(2)}
                        </Text>
                      </Space>
                    </div>
                  )}
                </Space>
              </Card>

                {/* Action Buttons */}
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Tooltip 
                    title={
                      totalPaid < parseFloat(finalTotal) ? 
                      "Please add sufficient payment methods" : ""
                    }
                  >
                    <Button
                      type="primary"
                      size="large"
                      htmlType="submit"
                      loading={isLoading}
                      disabled={
                        isLoading ||
                        cart.length === 0 || 
                        totalPaid < parseFloat(finalTotal)
                      }
                      style={{ width: '100%', height: '45px' }}
                    >
                      {id ? "🔄 Update Order" : "✅ Create Order"}
                    </Button>
                  </Tooltip>

                  <Space.Compact style={{ width: '100%' }}>
                    <Button 
                      icon={<ReloadOutlined />}
                      onClick={() => {
                        dispatch(resetState());
                        setPaymentAmounts({});
                      }}
                      disabled={isLoading}
                      style={{ flex: 1 }}
                    >
                      Reset
                    </Button>
                    <Button 
                      icon={<PauseOutlined />}
                      onClick={holdCurrentBill}
                      disabled={cart.length === 0 || isLoading}
                      style={{ flex: 1 }}
                    >
                      Hold
                    </Button>
                    <Button 
                      icon={<HistoryOutlined />}
                      onClick={() => setIsHeldBillsModalVisible(true)}
                      disabled={isLoading}
                      style={{ flex: 1 }}
                    >
                      Held ({heldBills.length})
                    </Button>
                  </Space.Compact>
                </Space>
              </Space>
            </Form>
          </Card>
        </Col>
      </Row>

      {/* Payment Method Modal */}
      <Modal
        title={
          <Space>
            {selectedPaymentMethod?.icon}
            Add {selectedPaymentMethod?.label} Payment
          </Space>
        }
        open={isPaymentModalVisible}
        onCancel={() => setIsPaymentModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsPaymentModalVisible(false)}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={confirmPaymentAmount}
            disabled={!tempPaymentAmount || parseFloat(tempPaymentAmount) <= 0}
          >
            Confirm Payment
          </Button>,
        ]}
        width={400}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* Quick Amounts for Cash */}
          {selectedPaymentMethod?.value === 'Cash' && (
            <div>
              <Text strong>Quick Amounts:</Text>
              <br />
              <Space wrap style={{ marginTop: '8px' }}>
                {selectedPaymentMethod.quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    size="small"
                    onClick={() => handleQuickAmount(amount)}
                    type={tempPaymentAmount === amount.toString() ? "primary" : "default"}
                  >
                    ₹{amount}
                  </Button>
                ))}
                <Button
                  size="small"
                  onClick={handleAutoFill}
                  type="dashed"
                >
                  Auto Fill
                </Button>
              </Space>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <Text strong>Amount (₹):</Text>
            <InputNumber
              style={{ width: '100%', marginTop: '8px' }}
              size="large"
              value={tempPaymentAmount}
              onChange={setTempPaymentAmount}
              placeholder="Enter amount"
              min={0}
              formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/₹\s?|(,*)/g, '')}
              autoFocus
            />
          </div>

          {/* Payment Summary */}
          <div style={{ 
            background: '#f0f8ff', 
            padding: '12px', 
            borderRadius: '6px',
            border: '1px solid #d6e4ff'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Order Total:</Text>
              <Text strong>₹{finalTotal}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Already Paid:</Text>
              <Text>₹{totalPaid.toFixed(2)}</Text>
            </div>
            <Divider style={{ margin: '8px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text strong>Remaining:</Text>
              <Text strong style={{ 
                color: (parseFloat(finalTotal) - totalPaid) > 0 ? '#ff4d4f' : '#52c41a' 
              }}>
                ₹{(parseFloat(finalTotal) - totalPaid).toFixed(2)}
              </Text>
            </div>
          </div>
        </Space>
      </Modal>

      {/* Held Bills Modal */}
      <Modal
        title={
          <Space>
            <HistoryOutlined />
            Held Bills ({heldBills.length})
          </Space>
        }
        open={isHeldBillsModalVisible}
        onCancel={() => setIsHeldBillsModalVisible(false)}
        footer={[
          <Button key="clearAll" danger onClick={clearAllHeldBills} disabled={heldBills.length === 0}>
            Clear All
          </Button>,
          <Button key="close" type="primary" onClick={() => setIsHeldBillsModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        <Table
          columns={heldBillsColumns}
          dataSource={heldBills}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          scroll={{ y: 300 }}
          locale={{ emptyText: 'No held bills' }}
        />
      </Modal>

      {/* Floating Action Button for Quick Payment */}
      {totalPaid > 0 && (
        <FloatButton
          icon={<WalletOutlined />}
          type="primary"
          tooltip="Payment Summary"
          onClick={() => {
            Modal.info({
              title: 'Payment Summary',
              width: 400,
              content: (
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Order Total">₹{finalTotal}</Descriptions.Item>
                  <Descriptions.Item label="Total Paid">₹{totalPaid.toFixed(2)}</Descriptions.Item>
                  <Descriptions.Item label="Balance">
                    <Text type={paymentDetails.balance > 0 ? "danger" : "success"}>
                      ₹{paymentDetails.balance.toFixed(2)}
                    </Text>
                  </Descriptions.Item>
                </Descriptions>
              ),
            });
          }}
        />
      )}
    </div>
  );
};

export default ModernPOS;