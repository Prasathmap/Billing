import React, { useEffect, useState, useMemo } from "react";
import { Table, Card, Typography, Tag, Alert, Divider, Grid, Space, Avatar, Button, Modal, Tabs, Badge } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getUsers } from "../features/cutomers/customerSlice";
import { UserOutlined, ShoppingOutlined, FileTextOutlined, CloseOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { useBreakpoint } = Grid;

const Customers = () => {
  const dispatch = useDispatch();
  const screens = useBreakpoint();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  const customerstate = useSelector((state) => state.customer.customers);
  
  // Process and clean customer data
  const customerData = useMemo(() => {
    const cleanPhoneNumber = (phone) => {
      if (!phone || phone === 'N/A') return null;
      // Convert scientific notation to full number
      
      // Remove any non-digit characters
      return phone;
    };

    const customersMap = new Map();

    customerstate.forEach((customer, index) => {
      if (customer.role === "admin") return;
      
      const phone = cleanPhoneNumber(customer.customerPhoneNumber);
      const name = customer.customerName === 'N/A' ? 'Anonymous' : customer.customerName;
      const key = `${name}_${phone}`;
      
      if (!customersMap.has(key)) {
        customersMap.set(key, {
          key: customersMap.size + 1,
          id: customer._id,
          name,
          phone,
          purchaseCount: 0,
          totalSpent: 0,
          invoices: [],
          lastPurchase: null
        });
      }
      
      const existing = customersMap.get(key);
      existing.purchaseCount += 1;
      existing.totalSpent += customer.GrandtotalAmount || 0;
      existing.invoices.push(customer);
      
      const invoiceDate = new Date(customer.createdAt);
      if (!existing.lastPurchase || invoiceDate > existing.lastPurchase) {
        existing.lastPurchase = invoiceDate;
      }
    });

    return Array.from(customersMap.values()).sort((a, b) => b.purchaseCount - a.purchaseCount);
  }, [customerstate]);

  // Calculate purchase summary for selected customer
  const purchaseSummary = useMemo(() => {
    if (!selectedCustomer) return [];
    
    const productMap = {};
    selectedCustomer.invoices.forEach(invoice => {
      (invoice.cartItems || []).forEach(item => {
        const productName = item.title || 'Unknown Product';
        if (!productMap[productName]) {
          productMap[productName] = {
            product: productName,
            quantity: 0,
            totalAmount: 0,
            purchases: []
          };
        }
        const itemTotal = (item.price || 0) * (item.quantity || 0) + (item.tax || 0);
        productMap[productName].quantity += item.quantity || 0;
        productMap[productName].totalAmount += itemTotal;
        productMap[productName].purchases.push({
          invoiceNo: invoice.invoiceno,
          date: invoice.createdAt,
          quantity: item.quantity,
          price: item.price,
          tax: item.tax
        });
      });
    });

    return Object.values(productMap).sort((a, b) => b.quantity - a.quantity);
  }, [selectedCustomer]);

  // Responsive table columns
  const customerColumns = [
    { 
      title: '#', 
      dataIndex: 'key', 
      width: 60,
      responsive: ['sm']
    },
    { 
      title: 'Name', 
      dataIndex: 'name',
      render: (text, record) => (
        <Space>
          <Text strong>{text}</Text>
          {record.name === 'Anonymous' && <Tag color="orange">Guest</Tag>}
        </Space>
      ),
      ellipsis: true
    },
    { 
      title: 'Phone', 
      dataIndex: 'phone',
      render: (phone) => phone || 'N/A',
      responsive: ['md']
    },
    { 
      title: 'Purchases', 
      render: (record) => (
        <Space direction="vertical" size={0}>
          <Badge 
            count={record.purchaseCount} 
            showZero 
            style={{ backgroundColor: record.purchaseCount > 0 ? '#52c41a' : '#d9d9d9' }} 
          />
          <Text type="secondary">₹{record.totalSpent.toFixed(2)}</Text>
        </Space>
      ),
      align: 'center',
      width: 120
    },
    { 
      title: 'Last Purchase', 
      render: (record) => record.lastPurchase ? record.lastPurchase.toLocaleDateString() : 'Never',
      responsive: ['lg']
    }
  ];

  const productSummaryColumns = [
    { 
      title: 'Product', 
      dataIndex: 'product',
      render: (text) => <Text strong>{text}</Text>,
      width: screens.xs ? 120 : undefined,
      ellipsis: !screens.md
    },
    { 
      title: 'Qty', 
      dataIndex: 'quantity',
      align: 'center',
      width: 80
    },
    { 
      title: 'Amount', 
      dataIndex: 'totalAmount',
      render: (amount) => `₹${amount.toFixed(2)}`,
      align: 'right',
      width: screens.xs ? 100 : undefined
    }
  ];

  const invoiceHistoryColumns = [
    { 
      title: 'Invoice', 
      dataIndex: 'invoiceno',
      render: (text) => <Text code>{text}</Text>,
      width: screens.xs ? 100 : undefined
    },
    { 
      title: 'Date', 
      dataIndex: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
      responsive: ['sm']
    },
    { 
      title: 'Items', 
      render: (record) => (record.cartItems || []).length,
      align: 'center',
      width: 80
    },
    { 
      title: 'Total', 
      dataIndex: 'GrandtotalAmount',
      render: (amount) => `₹${amount.toFixed(2)}`,
      align: 'right',
      width: screens.xs ? 100 : undefined
    }
  ];

  const handleRowClick = (record) => {
    setSelectedCustomer(record);
    setIsModalVisible(true);
  };

  const CustomerDetailModal = () => (
    <Modal
      title={
        <Space>
          <Avatar size="large" icon={<UserOutlined />} />
          <div>
            <Text strong style={{ display: 'block' }}>{selectedCustomer?.name}</Text>
            <Text type="secondary">{selectedCustomer?.phone || 'No phone number'}</Text>
          </div>
        </Space>
      }
      visible={isModalVisible}
      onCancel={() => setIsModalVisible(false)}
      footer={null}
      width={screens.xs ? '95%' : '80%'}
      style={{ top: 20 }}
      closeIcon={<CloseOutlined />}
      bodyStyle={{ padding: screens.xs ? '12px' : '24px' }}
    >
      <Tabs defaultActiveKey="summary">
        <TabPane
          tab={
            <span>
              <ShoppingOutlined />
              Purchase Summary
            </span>
          }
          key="summary"
        >
          {purchaseSummary.length > 0 ? (
            <Table
              dataSource={purchaseSummary}
              columns={productSummaryColumns}
              pagination={false}
              rowKey="product"
              size="small"
              scroll={screens.xs ? { x: true } : undefined}
              expandable={{
                expandedRowRender: (record) => (
                  <Table
                    dataSource={record.purchases}
                    columns={[
                      { title: 'Invoice', dataIndex: 'invoiceNo', render: (text) => <Text code>{text}</Text> },
                      { title: 'Date', dataIndex: 'date', render: (date) => new Date(date).toLocaleDateString() },
                      { title: 'Qty', dataIndex: 'quantity', align: 'center' },
                      { title: 'Price', dataIndex: 'price', render: (price) => `₹${price}`, align: 'right' }
                    ]}
                    size="small"
                    pagination={false}
                  />
                ),
                rowExpandable: (record) => record.purchases.length > 0
              }}
              summary={() => (
                <Table.Summary.Row style={{ fontWeight: 'bold', backgroundColor: '#fafafa' }}>
                  <Table.Summary.Cell>Total</Table.Summary.Cell>
                  <Table.Summary.Cell>
                    <Tag color="blue">
                      {purchaseSummary.reduce((sum, item) => sum + item.quantity, 0)}
                    </Tag>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell>
                    <Text strong>₹{purchaseSummary.reduce((sum, item) => sum + item.totalAmount, 0).toFixed(2)}</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
          ) : (
            <Alert message="No product details found" type="warning" showIcon />
          )}
        </TabPane>
        
        <TabPane
          tab={
            <span>
              <FileTextOutlined />
              Invoice History
            </span>
          }
          key="history"
        >
          {selectedCustomer?.invoices?.length > 0 ? (
            <Table
              dataSource={selectedCustomer.invoices}
              columns={invoiceHistoryColumns}
              rowKey="_id"
              size="small"
              scroll={screens.xs ? { x: true } : undefined}
              pagination={{
                pageSize: 5,
                showSizeChanger: false
              }}
            />
          ) : (
            <Alert message="No invoices found" type="info" showIcon />
          )}
        </TabPane>
      </Tabs>
    </Modal>
  );

  return (
    <div style={{ padding: screens.xs ? '12px' : '20px' }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Title level={3} style={{ marginBottom: 0 }}>Customer Management</Title>
        <Text type="secondary">View and manage all your customers and their purchase history</Text>
        
        <Card 
          bordered={false} 
          bodyStyle={{ padding: screens.xs ? '12px' : '16px' }}
          headStyle={{ borderBottom: screens.xs ? 'none' : undefined }}
        >
          <Table
            dataSource={customerData}
            columns={customerColumns}
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
            })}
            rowClassName="clickable-row"
            scroll={screens.xs ? { x: true } : undefined}
            size={screens.xs ? 'small' : 'middle'}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['10', '25', '50'],
              showTotal: (total) => `Total ${total} customers`
            }}
          />
        </Card>
      </Space>

      {selectedCustomer && <CustomerDetailModal />}
    </div>
  );
};

export default Customers;