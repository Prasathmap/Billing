import React,{ useEffect, useState, useMemo } from "react";
import { Column } from "@ant-design/plots";
import { useDispatch, useSelector } from "react-redux";
import { getReport, getOrders } from "../features/sales/salesSlice";
import { getProducts } from "../features/product/productSlice";
import { getEmployees } from "../features/employee/employeeSlice";
import { getCategories } from "../features/pcategory/pcategorySlice";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { MdCategory, MdBalance } from "react-icons/md";
import { FaProductHunt } from "react-icons/fa";
import { FaUsers, FaArrowTrendUp, FaArrowTrendDown } from "react-icons/fa6";
import { getExpanceReport } from "../features/ecategory/expanceSlice";
import { Card, Spin, Row, Col, Statistic, Radio, Select, Divider, Typography } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { PieChart, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Pie, Cell, Legend } from "recharts";

const { Title, Text } = Typography;
const { Option } = Select;

const Dashboard = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("yearly");
  const [viewType, setViewType] = useState("Income");

  const reportData = useSelector((state) => state?.sales?.report);
  const expenseReport = useSelector((state) => state?.expance?.report);
  const productState = useSelector((state) => state?.product?.products);
  const employeeState = useSelector((state) => state.employee?.employees);
  const categoryState = useSelector((state) => state.pCategory?.pCategories);
  const orderState = useSelector((state) => state?.sales?.orders || []);

  const [dataMonthly, setDataMonthly] = useState([]);
  const [dataMonthlySales, setDataMonthlySales] = useState([]);
  const [dataMonthlyExpense, setDataMonthlyExpense] = useState([]);
  const [thisMonthIncome, setThisMonthIncome] = useState(0);
  const [thisMonthSales, setThisMonthSales] = useState(0);
  const [dataYearly, setDataYearly] = useState([]);
  const [dataYearlyExpense, setDataYearlyExpense] = useState([]);
  const [dataToday, setDataToday] = useState([]);
  const [dataSales, setDataSales] = useState([]);
  const [dataDailyExpense, setDataDailyExpense] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayVsYesterdayPieData, setTodayVsYesterdayPieData] = useState({ income: [], sales: [] });
  
  const COLORS = ['#4CAF50', '#F44336', '#2196F3', '#FFC107', '#9C27B0'];
  const CARD_COLORS = {
    Income: '#4CAF50',
    Sales: '#2196F3',
    Expense: '#F44336',
    Product: '#9C27B0',
    Employee: '#FF9800',
    Category: '#607D8B'
  };

  const getAuthToken = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user).token : "";
  };

  const selectedMonth = 5;
  const selectedYear = 2025;
  const selectedDay = null;

  const filteredOrders = orderState?.filter((invoice) => {
    const date = dayjs(invoice.createdAt);
    const matchesMonth = date.month() + 1 === selectedMonth && date.year() === selectedYear;
    const matchesDay = selectedDay ? date.date() === selectedDay : true;
    return matchesMonth && matchesDay;
  }) || [];

  const amounts = orderState?.map(order => Number(order.GrandtotalAmount)) || [];
  const averageSales = amounts.length ? Number((amounts.reduce((a, b) => a + b, 0) / amounts.length).toFixed(2)) : 0;
  const maxSale = amounts.length ? Math.max(...amounts) : 0;
  const minSale = amounts.length ? Math.min(...amounts) : 0;

  const dailyData = {};
  filteredOrders.forEach(invoice => {
    const date = dayjs(invoice.createdAt).format("YYYY-MM-DD");
    const amount = Number(invoice.GrandtotalAmount || 0);
    dailyData[date] = (dailyData[date] || 0) + amount;
  });

  const generateChartConfig = (data, yFieldAlias, color) => {
    const defaultColors = {
      Income: "#4CAF50",
      Sales: "#2196F3",
      Expense: "#F44336",
    };

    return {
      data,
      xField: "type",
      yField: "value",
      color: color || defaultColors[yFieldAlias] || "#9C27B0",
      label: {
        position: "middle",
        style: {
          fill: "#FFFFFF",
          opacity: 1,
        },
      },
      xAxis: {
        label: {
          autoHide: true,
          autoRotate: false,
        },
      },
      meta: {
        type: { alias: "Period" },
        value: { alias: yFieldAlias },
      },
      height: 250,
      autoFit: true,
    };
  };
      const formatIndianNumber = (num) => {
      if (num >= 1_00_00_000) return (num / 1_00_00_000).toFixed(2) + ' Cr';
      if (num >= 1_00_000) return (num / 1_00_000).toFixed(2) + ' L';
      if (num >= 1_000) return (num / 1_000).toFixed(2) + 'K';
      return (num || 0).toString(); // Fallback to 0 safely
    };

    const rawTotalIncome = reportData?.yearlyTotalOrders?.reduce((sum, item) => sum + (item.GrandtotalAmount || 0), 0) || 0;
    const totalIncome = formatIndianNumber(rawTotalIncome);
    const totalSales = reportData?.yearlyTotalOrders?.reduce((sum, item) => sum + (item.count || 0), 0) || 0;
    const todaySalesData = reportData?.lastSevenDays?.find( data => data.date === new Date().toISOString().split("T")[0]);

  const [todayPaymentSummary, setTodayPaymentSummary] = useState({
    Cash: 0,
    CreditCard: 0,
    OnlinePay: 0,
  });

  const productCount = productState?.length || 0;
  const employeeCount = employeeState?.length || 0;
  const categoryCount = categoryState?.length || 0;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = getAuthToken();
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };
      const config = { headers };
      await Promise.all([
        dispatch(getProducts(config)),
        dispatch(getEmployees(config)),
        dispatch(getCategories(config)),
        dispatch(getReport(config)),
        dispatch(getOrders(config)),
        dispatch(getExpanceReport(config))
      ]);
      setLoading(false);
    };

    fetchData();
  }, [dispatch]);

 useEffect(() => {
    if (reportData) {
      const yearlyData = reportData.yearlyTotalOrders.map((element) => ({
        type: element._id?.year || "Unknown Year",
        value: element.GrandtotalAmount || 0,
      }));
      setDataYearly(yearlyData);

      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const currentYearMonth = `${new Date().getFullYear()}-${String(
        new Date().getMonth() + 1
      ).padStart(2, "0")}`;

      const incomeData = [];
      const salesData = [];
      let incomeThisMonth = 0;
      let salesThisMonth = 0;

      reportData.monthWiseOrderIncome.forEach((element) => {
        const [year, month] = element._id.split("-").map(Number);
        const monthIndex = month - 1;
        const income = element.GrandtotalAmount || 0;
        const sales = element.count || 0;

        incomeData.push({
          type: monthNames[monthIndex],
          value: income,
        });

        salesData.push({
          type: monthNames[monthIndex],
          value: sales,
        });

        if (element._id === currentYearMonth) {
          incomeThisMonth = income;
          salesThisMonth = sales;
        }
      });

      setDataMonthly(incomeData);
      setDataMonthlySales(salesData);
      setThisMonthIncome(formatIndianNumber(incomeThisMonth));
      setThisMonthSales(salesThisMonth);

      const stateWiseIncomeData = [];
      const stateWiseSalesData = [];

      reportData.lastSevenDays.forEach((data) => {
        const [year, month, day] = data.date.split("-").map(Number);
        const formattedDate = `${month < 10 ? "0" + month : month}/${day < 10 ? "0" + day : day}`;

        stateWiseIncomeData.push({
          type: formattedDate,
          value: data.earnings,
        });

        stateWiseSalesData.push({
          type: formattedDate,
          value: data.invoiceCount,
        });
      });

      setDataSales(stateWiseSalesData);
      setDataToday(stateWiseIncomeData);
    }
  }, [reportData]);
  const getDataForView = (tab) => {
      if (tab === "yearly") {
        if (viewType === "Income") return dataYearly;
        if (viewType === "Sales") return dataYearly.map(item => ({
          ...item,
          value: reportData?.yearlyTotalOrders?.find(y => y._id?.year === item.type)?.count || 0
        }));
        if (viewType === "Expense") return dataYearlyExpense;
      } else if (tab === "monthly") {
        if (viewType === "Income") return dataMonthly;
        if (viewType === "Sales") return dataMonthlySales;
        if (viewType === "Expense") return dataMonthlyExpense;
      } else if (tab === "daily") {
        if (viewType === "Income") return dataToday;
        if (viewType === "Sales") return dataSales;
        if (viewType === "Expense") return dataDailyExpense;
      }
      return [];
    };


  useEffect(() => {
    if (expenseReport) {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];  
      // Yearly Expenses
      const yearly = expenseReport.yearlyTotalOrders?.map(el => ({
        type: el._id?.year?.toString() || "Unknown",
        value: el.amount || 0,
      })) || [];
  
      setDataYearlyExpense(yearly);
  
      // Monthly Expenses
      const monthly = expenseReport.monthWiseOrderIncome?.map(el => {
        const [year, month] = el._id.split("-").map(Number);
        return {
          type: monthNames[month - 1],
          value: el.amount || 0,
        };
      }) || [];
  
      setDataMonthlyExpense(monthly);
  
      // Daily Expenses
      const daily = expenseReport.lastSevenDays?.map(el => {
        const [year, month, day] = el.date.split("-").map(Number);
        return {
          type: `${monthNames[month - 1]} ${day}`,
          value: el.expances || 0,
        };
      }) || [];
  
      setDataDailyExpense(daily);
    }
  }, [expenseReport]);

  const paymentSummaryData = useMemo(() => {
    if (!Array.isArray(reportData?.lastSevenDays)) return [];
    
    return reportData.lastSevenDays.map((data) => {
      const [year, month, day] = data.date.split("-").map(Number);
      const formattedDate = `${month}/${day}`;
      return {
        date: formattedDate,
        ...data.paymentSummary
      };
    });
  }, [reportData]);


  useEffect(() => {
    if (Array.isArray(reportData?.lastSevenDays)) {
      const stateWiseIncomeData = [];
      const stateWiseSalesData = [];
      let today = new Date();

      reportData.lastSevenDays.forEach((data) => {
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
    let yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const formatDate = (d) => d.toISOString().split("T")[0];

    const todayStr = formatDate(today);
    const yesterdayStr = formatDate(yesterday);

    let todayData = null;
    let yesterdayData = null;

    reportData.lastSevenDays.forEach((data) => {
      if (data.date === todayStr) {
        todayData = data;
      }
      if (data.date === yesterdayStr) {
        yesterdayData = data;
      }
    });

    // Set data for pie chart
    setTodayVsYesterdayPieData({
      income: [
        { name: "Today", value: todayData?.earnings || 0 },
        { name: "Yesterday", value: yesterdayData?.earnings || 0 },
      ],
      sales: [
        { name: "Today", value: todayData?.invoiceCount || 0 },
        { name: "Yesterday", value: yesterdayData?.invoiceCount || 0 },
      ],
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
  }, [reportData]);

  const StatCard = ({ title, value, icon, color, prefix, trend, trendValue }) => (
    <Card 
      hoverable
      className="stat-card"
      bodyStyle={{ 
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
      style={{ 
        borderRadius: '12px',
        borderLeft: `4px solid ${color}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.09)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <Text type="secondary" style={{ fontSize: '14px' }}>{title}</Text>
        <div style={{ 
          background: `${color}20`, 
          padding: '8px', 
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {React.cloneElement(icon, { 
            style: { 
              color: color,
              fontSize: '16px'
            } 
          })}
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
        <Title level={3} style={{ margin: 0, color: '#2c3e50' }}>
          {prefix}{value}
        </Title>
        {trend && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            color: trend === 'up' ? '#4CAF50' : '#F44336',
            fontSize: '12px',
            marginBottom: '4px'
          }}>
            {trend === 'up' ? <FaArrowTrendUp /> : <FaArrowTrendDown />}
            <span style={{ marginLeft: '4px' }}>{trendValue}%</span>
          </div>
        )}
      </div>
    </Card>
  );

  const ChartContainer = ({ title, children, style }) => (
    <Card
      title={<Text strong>{title}</Text>}
      className="chart-container"
      style={{ 
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
        ...style
      }}
      bodyStyle={{ padding: '16px' }}
    >
      {children}
    </Card>
  );

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <Title level={3} className="dashboard-title">Dashboard Overview</Title>
        <Text type="secondary" className="dashboard-subtitle">
          Key metrics and analytics at a glance
        </Text>
        <Divider className="dashboard-divider" />
      </div>

      <Spin spinning={loading} size="large">
        {/* Summary Cards */}
        <div className="dashboard-summary">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={4}>
              <StatCard
                title="Total Income"
                value={totalIncome}
                icon={<FaIndianRupeeSign />}
                color="#4CAF50"
                prefix="₹"
                trend="up"
                trendValue="12.5"
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <StatCard
                title="Total Sales"
                value={totalSales}
                icon={<ShoppingCartOutlined />}
                color="#2196F3"
                trend="up"
                trendValue="8.3"
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <StatCard
                title="This Month Income"
                value={thisMonthIncome}
                icon={<FaIndianRupeeSign />}
                color="#4CAF50"
                prefix="₹"
                trend="down"
                trendValue="2.1"
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <StatCard
                title="This Month Sales"
                value={thisMonthSales}
                icon={<ShoppingCartOutlined />}
                color="#2196F3"
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <StatCard
                title="Today Income"
                value={todaySalesData?.earnings || 0}
                icon={<FaIndianRupeeSign />}
                color="#4CAF50"
                prefix="₹"
                trend="down"
                trendValue="2.1"
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <StatCard
                title="Today Sales"
                value={todaySalesData?.invoiceCount || 0}
                icon={<ShoppingCartOutlined />}
                color="#2196F3"
              />
            </Col>
          </Row>
        </div>

        {/* Data Metrics */}
        <div className="dashboard-metrics" style={{ marginTop: '24px' }}>
          <Title level={5} style={{ marginBottom: '16px' }}>Data Metrics</Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <StatCard
                title="Products"
                value={productCount}
                icon={<FaProductHunt />}
                color="#9C27B0"
              />
               
            </Col>
            <Col xs={24} sm={12} md={8}>
              <StatCard
                title="Employees"
                value={employeeCount}
                icon={<FaUsers />}
                color="#FF9800"
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <StatCard
                title="Categories"
                value={categoryCount}
                icon={<MdCategory />}
                color="#607D8B"
              />
            </Col>
          </Row>
        </div>

        {/* Charts Section */}
        <div className="dashboard-charts" style={{ marginTop: '24px' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <ChartContainer title="Performance Trends">
                <div className="chart-controls">
                  <Radio.Group
                    options={["Income", "Sales", "Expense"]}
                    onChange={(e) => setViewType(e.target.value)}
                    value={viewType}
                    optionType="button"
                    buttonStyle="solid"
                    size="middle"
                  />
                  <Select
                    value={activeTab}
                    onChange={setActiveTab}
                    style={{ width: 150, marginLeft: '16px' }}
                    size="middle"
                  >
                    <Option value="yearly">Yearly Data</Option>
                    <Option value="monthly">Monthly Data</Option>
                    <Option value="daily">Daily Data</Option>
                  </Select>
                </div>
                <div style={{ height: '300px', marginTop: '16px' }}>
                  <Column {...generateChartConfig(getDataForView(activeTab), viewType)} />
                </div>
              </ChartContainer>
            </Col>
            
            <Col xs={24} lg={12}>
              <ChartContainer title="Payment Methods - Last 7 Days">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={paymentSummaryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fill: '#666' }} />
                    <YAxis tick={{ fill: '#666' }} />
                    <Tooltip 
                      formatter={(value) => [`₹${value}`, 'Amount']}
                      contentStyle={{ borderRadius: '8px' }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="Cash" 
                      fill="#8884d8" 
                      name="Cash" 
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="CreditCard" 
                      fill="#82ca9d" 
                      name="Credit Card" 
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="OnlinePay" 
                      fill="#ffc658" 
                      name="Online Pay" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </Col>
          </Row>
        </div>

        {/* Comparison Section */}
        <div className="dashboard-comparison" style={{ marginTop: '24px' }}>
          <Title level={5} style={{ marginBottom: '16px' }}>Performance Comparison</Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <ChartContainer title="Income Comparison">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={todayVsYesterdayPieData.income}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {todayVsYesterdayPieData.income.map((entry, index) => (
                        <Cell key={`cell-income-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </Col>
            <Col xs={24} md={12}>
              <ChartContainer title="Sales Comparison">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={todayVsYesterdayPieData.sales}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {todayVsYesterdayPieData.sales.map((entry, index) => (
                        <Cell key={`cell-sales-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </Col>
          </Row>
        </div>

        {/* Sales Analytics */}
        <div className="dashboard-analytics" style={{ marginTop: '24px' }}>
          <Title level={5} style={{ marginBottom: '16px' }}>Sales Analytics</Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <StatCard
                title="Average Sale"
                value={averageSales}
                icon={<MdBalance />}
                color="#9C27B0"
                prefix="₹"
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <StatCard
                title="Max Sale"
                value={maxSale}
                icon={<FaArrowTrendUp />}
                color="#4CAF50"
                prefix="₹"
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <StatCard
                title="Min Sale"
                value={minSale}
                icon={<FaArrowTrendDown />}
                color="#F44336"
                prefix="₹"
              />
            </Col>
          </Row>
        </div>
      </Spin>

    </div>
  );
};

export default Dashboard;