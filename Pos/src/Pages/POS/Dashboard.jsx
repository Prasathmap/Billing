import React, { useEffect, useMemo, useState } from "react";
import { Card, Row, Col, Statistic } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { FaIndianRupeeSign ,FaWallet } from "react-icons/fa6";
import { FcSalesPerformance } from "react-icons/fc";
import { getTodayData } from "../../features/invoices/invoiceSlice";
import { getTodayExpance } from "../../features/expance/expanceSlice";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const dispatch = useDispatch();

  const todayDataState = useSelector((state) => state?.invoice?.todayData);
  const todayExpanceState = useSelector((state) => state?.expance?.todayExpance);

  const [dataToday, setDataToday] = useState([]);
  const [dataexpanceToday, setDataexpanceToday] = useState([]);
  const [dataSales, setDataSales] = useState([]);
  const [dataExpance, setDataExpance] = useState([]);
  const [todayPaymentSummary, setTodayPaymentSummary] = useState({
    Cash: 0,
    CreditCard: 0,
    OnlinePay: 0,
  });
  const paymentSummaryData = useMemo(() => {
    if (!Array.isArray(todayDataState?.lastSevenDays)) return [];
    
    return todayDataState.lastSevenDays.map((data) => {
      const [year, month, day] = data.date.split("-").map(Number);
      const formattedDate = `${month}/${day}`;
      return {
        date: formattedDate,
        ...data.paymentSummary
      };
    });
  }, [todayDataState]);

  useEffect(() => {
    dispatch(getTodayData({ date: new Date().toISOString().split("T")[0] }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(getTodayExpance({ date: new Date().toISOString().split("T")[0] }));
  }, [dispatch]);

  useEffect(() => {
    if (Array.isArray(todayDataState?.lastSevenDays)) {
      const stateWiseIncomeData = [];
      const stateWiseSalesData = [];
  
      todayDataState.lastSevenDays.forEach((data) => {
        const [year, month, day] = data.date.split("-").map(Number);
        const formattedDate = `${month}/${day}`;
  
        stateWiseIncomeData.push({
          type: formattedDate,
          value: data.earnings,
          label: "Income",
        });
  
        stateWiseSalesData.push({
          type: formattedDate,
          value: data.invoiceCount,
          label: "Sales",
        });

        // Get today's payment summary
        if (data.date === new Date().toISOString().split("T")[0]) {
          setTodayPaymentSummary(data.paymentSummary || {
            Cash: 0,
            CreditCard: 0,
            OnlinePay: 0,
          });
        }
      });
  
      setDataSales(stateWiseSalesData);
      setDataToday(stateWiseIncomeData);
    }
  }, [todayDataState]);
  
  useEffect(() => {
    if (Array.isArray(todayExpanceState?.lastSevenDays)) {
      const stateWiseExpanceData = [];
      const stateWisecountData = [];
  
      todayExpanceState.lastSevenDays.forEach((data) => {
        const [year, month, day] = data.date.split("-").map(Number);
        const formattedDate = `${month}/${day}`;
  
        stateWiseExpanceData.push({
          type: formattedDate,
          value: data.expances,
          label: "Expance"
        });
  
        stateWisecountData.push({
          type: formattedDate,
          value: data.expanceCount,
          label: "Total"
        });
      });
  
      setDataExpance(stateWisecountData);
      setDataexpanceToday(stateWiseExpanceData);
    }
  }, [todayExpanceState]);
  

  const chartData = useMemo(() => {
    return Array.isArray(todayDataState?.lastSevenDays)
      ? todayDataState.lastSevenDays.map((data) => ({
          date: data.date,
          invoiceCount: data.invoiceCount,
          earnings: data.earnings,
        }))
      : [];
  }, [todayDataState]);
  

  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="dashboard-container" style={{ padding: '16px' }}>
    {/* Header */}
    
    <div
      className="dashboard-header"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px'
      }}
    >
      <h3 style={{ margin: 0 }}>Welcome</h3>
      <h3 style={{ margin: 0 }}>{today}</h3>
    </div>

    {/* Today Report and Payment Summary */}
    <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
      {/* Today Report */}
      <Col xs={24} md={12}>
        <Card title="Today Report" bodyStyle={{ padding: '16px' }}>
          <Row gutter={[16, 16]}>
            {/* Income */}
            <Col xs={24} sm={12} md={8}>
              <Card hoverable bodyStyle={{ padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <div className="dashboard-icon" style={{ fontSize: '20px' }}>
                    <FaIndianRupeeSign />
                  </div>
                  <Statistic
                    title="Income"
                    value={dataToday.find((d) => d.label === 'Income')?.value || 0}
                    valueStyle={{ color: '#008000' }}
                  />
                </div>
              </Card>
            </Col>

            {/* Sales */}
            <Col xs={24} sm={12} md={8}>
              <Card hoverable bodyStyle={{ padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <div className="dashboard-icon" style={{ fontSize: '20px' }}>
                    <FcSalesPerformance />
                  </div>
                  <Statistic
                    title="Sales"
                    value={dataSales.find((d) => d.label === 'Sales')?.value || 0}
                  />
                </div>
              </Card>
            </Col>

            {/* Expance */}
            <Col xs={24} sm={12} md={8}>
              <Card hoverable bodyStyle={{ padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <div className="dashboard-icon" style={{ fontSize: '20px' }}>
                    <FaWallet />
                  </div>
                  <Statistic
                    title="Expense"
                    value={dataexpanceToday.find((d) => d.label === 'Expance')?.value || 0}
                    prefix="₹"
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </div>
              </Card>
            </Col>
          </Row>
        </Card>
      </Col>

      {/* Payment Summary */}
      <Col xs={24} md={12}>
        <Card title="Payment Summary" bodyStyle={{ padding: '16px' }}>
          <Row gutter={[16, 16]}>
            {[
              { label: 'Cash', icon: <FaIndianRupeeSign />, key: 'Cash' },
              { label: 'OnlinePay', icon: '🌐', key: 'OnlinePay' },
              { label: 'CreditCard', icon: '🪙', key: 'CreditCard' }
            ].map(({ label, icon, key }) => (
              <Col xs={12} sm={12} md={8} key={key}>
                <Card hoverable bodyStyle={{ padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <div className="dashboard-icon" style={{ fontSize: '20px' }}>{icon}</div>
                    <Statistic
                      title={label}
                      value={todayPaymentSummary[key] || 0}
                      valueStyle={{ color: '#ff4d4f' }}
                    />
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      </Col>
    </Row>

    {/* Charts */}
    <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
      {/* Sales Overview */}
      <Col xs={24} md={12}>
        <Card title="Sales Overview">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="invoiceCount" fill="#1890ff" name="Invoice Count" />
              <Bar dataKey="earnings" fill="#52c41a" name="Earnings" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Col>

      {/* Payment Chart */}
      <Col xs={24} md={12}>
        <Card title="Payment Types Overview">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={paymentSummaryData} stackOffset="stack">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Cash" stackId="a" fill="#8884d8" name="Cash" />
              <Bar dataKey="CreditCard" stackId="a" fill="#82ca9d" name="Credit Card" />
              <Bar dataKey="OnlinePay" stackId="a" fill="#ffc658" name="Online Pay" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Col>
    </Row>
  </div>
  );
};

export default Dashboard;