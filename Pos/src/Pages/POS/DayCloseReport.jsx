import {Card,Table,Typography,Button,Col,Statistic,Divider,Row,InputNumber,} from "antd";
import { DownloadOutlined, PrinterOutlined } from "@ant-design/icons";
import { useState, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTodayData, getOrders } from "../../features/invoices/invoiceSlice";

const { Title, Text } = Typography;
const DEFAULT_DENOMS = [500, 200, 100, 50, 20, 10, 5, 2, 1];

const DayCloseReport = () => {
  const dispatch = useDispatch();

  const todayDataState = useSelector((state) => state?.invoice?.todayData || {});
 const orders = useSelector((state) => state.invoice.orders || []);
  const [denominations, setDenominations] = useState([]);
  const [denominationTotal, setDenominationTotal] = useState(0);
  const [todayPaymentSummary, setTodayPaymentSummary] = useState({
    Cash: 0,
    CreditCard: 0,
    OnlinePay: 0,
  });

  // Fetch data on mount
  useEffect(() => {
    dispatch(getTodayData({ date: new Date().toISOString().split("T")[0] }));
    dispatch(getOrders());
  }, [dispatch]);

  // Initialize denominations
  useEffect(() => {
    const rows = DEFAULT_DENOMS.map((value) => ({
      denom: `₹${value}`,
      value,
      count: 0,
      total: 0,
    }));
    setDenominations(rows);
  }, []);

  const cashAmount = todayPaymentSummary?.Cash || 0;
const printRef = useRef();

  const handlePrintTable = () => {
    const printContents = printRef.current.innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload(); // reload to reattach React events
  };
  // Auto-fill denominations
  const autoFillDenominations = () => {
    let remaining = cashAmount;
    const filled = DEFAULT_DENOMS.map((val) => {
      const count = Math.floor(remaining / val);
      const total = count * val;
      remaining -= total;
      return {
        denom: `₹${val}`,
        value: val,
        count,
        total,
      };
    });
    setDenominations(filled);
    setDenominationTotal(cashAmount);
  };

  const handleDenominationChange = (value, index) => {
    const updated = [...denominations];
    updated[index].count = value || 0;
    updated[index].total = updated[index].count * updated[index].value;

    let total = updated.reduce((acc, row) => acc + row.total, 0);

    const oneIndex = updated.findIndex((row) => row.value === 1);
    if (oneIndex !== -1 && index !== oneIndex && cashAmount !== undefined) {
      const diff = cashAmount - (total - updated[oneIndex].total);
      const newCount = Math.max(0, Math.floor(diff));
      updated[oneIndex].count = newCount;
      updated[oneIndex].total = newCount;
      total = updated.reduce((acc, row) => acc + row.total, 0);
    }

    setDenominations(updated);
    setDenominationTotal(total);
  };

  const totalInvoices = useMemo(() => {
    return (
      todayDataState?.lastSevenDays?.find(
        (d) => d.date === new Date().toISOString().split("T")[0]
      )?.invoiceCount || 0
    );
  }, [todayDataState]);

  const totalIncome = useMemo(() => {
    return (
      todayDataState?.lastSevenDays?.find(
        (d) => d.date === new Date().toISOString().split("T")[0]
      )?.earnings || 0
    );
  }, [todayDataState]);

  useEffect(() => {
    if (Array.isArray(todayDataState?.lastSevenDays)) {
      todayDataState.lastSevenDays.forEach((data) => {
        if (data.date === new Date().toISOString().split("T")[0]) {
          setTodayPaymentSummary(data.paymentSummary || {
            Cash: 0,
            CreditCard: 0,
            OnlinePay: 0,
          });
        }
      });
    }
  }, [todayDataState]);
   // Get today's date as string "YYYY-MM-DD"
  const todayStr = new Date().toISOString().split("T")[0];

  // Filter only today's orders
  const todaysOrders = useMemo(() => {
    return orders.filter(order => {
      const createdAt = order.createdAt || "";
      return createdAt.startsWith(todayStr);
    });
  }, [orders, todayStr]);

  // Aggregate total quantity and total price per product
  const productAggregates = useMemo(() => {
    const summary = {};

    todaysOrders.forEach(order => {
      (order.cartItems || []).forEach(item => {
        const title = item.title || "Unknown";
        const qty = Number(item.quantity || item.qty || 0);
        const price = Number(item.price || 0);

        if (!summary[title]) {
          summary[title] = { totalQty: 0, totalPrice: 0 };
        }

        summary[title].totalQty += qty;
        summary[title].totalPrice += qty * price;
      });
    });

    // Convert to array for rendering in table
    return Object.entries(summary).map(([product, data]) => ({
      key: product,
      product,
      totalQty: data.totalQty,
      totalPrice: data.totalPrice.toFixed(2),
    }));
  }, [todaysOrders]);

  // Columns for Ant Design Table
  const columns = [
    {
      title: "Product",
      dataIndex: "product",
      key: "product",
    },
    {
      title: "Total Quantity",
      dataIndex: "totalQty",
      key: "totalQty",
    },
    {
      title: "Total Price",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (val) => `₹${val}`,
    },
  ];

  const denomColumns = [
    { title: "Denomination", dataIndex: "denom", key: "denom" },
    {
      title: "Count",
      dataIndex: "count",
      key: "count",
      render: (_, record, index) => (
        <InputNumber
          min={0}
          value={record.count}
          onChange={(value) => handleDenominationChange(value, index)}
        />
      ),
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (val) => `₹${val}`,
    },
  ];

  return (
    <Card>
     <div className="flex justify-between items-center mb-4">
        <div className="dashboard-header"  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', rowGap: '8px',columnGap: '16px',}}>
            <div style={{ flex: 1, minWidth: '200px' }}>
                <Title level={3} style={{ margin: 0 }}>Day Close Report</Title>
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
                Print
                </Button>
                <Button icon={<DownloadOutlined />}>Export</Button>
            </div>
        </div>      
    </div>

  <Row gutter={24}>
    <Col xs={24} md={14}>
      <Card title="Sales Summary" bordered={false} style={{ marginBottom: 20,borderRadius: 8,boxShadow: "0 2px 8px rgba(0,0,0,0.1)"}}
            headStyle={{ backgroundColor: "#f0f7ff",borderBottom: "1px solid #e8e8e8",padding: "10px 20px",fontSize: 16,fontWeight: 500,borderRadius: "8px 8px 0 0"}}
       >
    <div style={{ display: "flex", gap: 24, marginBottom: 16 }}>
    <div style={{ backgroundColor: "#f6f6f6",  padding: "12px 16px", borderRadius: 8,flex: 1}}>
      <div style={{ color: "#666", fontSize: 14, marginBottom: 4 }}>Total Invoices</div>
      <div style={{ fontSize: 20, fontWeight: 600,color: "#1890ff"}}>{totalInvoices}</div>
    </div>
    
    <div style={{ backgroundColor: "#f6f6f6", padding: "12px 16px", borderRadius: 8,flex: 1}}>
      <div style={{ color: "#666", fontSize: 14, marginBottom: 4 }}> Total Income</div>
      <div style={{ fontSize: 20,  fontWeight: 600,color: "#52c41a" }}> ₹{totalIncome.toLocaleString()} </div>
    </div>
  </div>

  <Row gutter={[16, 16]} className="mt-4">
    {["Cash", "OnlinePay", "CreditCard"].map((key) => (
      <Col key={key} xs={24} sm={12} md={8}>
        <Card hoverable bodyStyle={{ padding: "16px",borderRadius: 8}}style={{borderRadius: 8,border: "1px solid #f0f0f0" }}>
          <Statistic
            title={<span style={{ color: "#595959" }}>{key}</span>}
            value={todayPaymentSummary[key] || 0}
            valueStyle={{  color: "#3f8600", fontSize: 18, fontWeight: 600}}
            prefix="₹"
          />
        </Card>
      </Col>
    ))}
  </Row>
</Card>
      
      {/* Product Sales Summary */}
      <div className="mt-4" ref={printRef}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, marginBottom: 8 }}>
        <Title level={3} style={{ margin: 0 }}>
            Product Sales Summary for Today ({todayStr})
        </Title>
        <Button type="primary" onClick={handlePrintTable}>
            Print
        </Button>
        </div>
        <Table
            style={{ maxHeight: "300px", overflowY: "auto", paddingRight: "8px" }}
            dataSource={productAggregates}
            columns={columns}
            pagination={false}
            bordered
            size="small"
            summary={(pageData) => {
    let totalSum = 0;

    pageData.forEach(({ totalPrice }) => {
      totalSum += parseFloat(totalPrice || 0);
    });

    return (
      <Table.Summary.Row>
        <Table.Summary.Cell index={0}><strong>Total</strong></Table.Summary.Cell>
        <Table.Summary.Cell index={1}></Table.Summary.Cell>
        <Table.Summary.Cell index={2}><strong>₹{totalSum.toFixed(2)}</strong></Table.Summary.Cell>
      </Table.Summary.Row>
    );
  }}
        />
    </div>
    </Col>

    {/* Right Column */}
    <Col xs={24} md={10}>
      <Divider orientation="left" className="mt-0">
        Denomination Entry
      </Divider>
      <div className="mb-2 text-right">
        <Button type="dashed" onClick={autoFillDenominations}>
          Auto Fill to Match Cash
        </Button>
      </div>
      <Table
        columns={denomColumns}
        dataSource={denominations}
        rowKey="value"
        pagination={false}
        size="small"
      />
      <div className="text-right mt-2">
        <Text strong>Grand Total: ₹{denominationTotal}</Text>
      </div>
    </Col>
  </Row>
</Card>
  );
};

export default DayCloseReport;
