import React, { useState, useEffect } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
} from "@ant-design/icons";
import {
  AiOutlineDashboard,
  AiOutlineShoppingCart,
  AiOutlineUser,
  AiOutlineLogout,
  AiOutlineLogin,
} from "react-icons/ai";
import { RiCouponLine } from "react-icons/ri";
import { FaStore, FaClipboardList, FaUsers } from "react-icons/fa";
import { BiCategoryAlt } from "react-icons/bi";
import {
  Layout,
  Menu,
  theme,
  Spin,
  Drawer,
  Button,
  Dropdown,
  Badge,
} from "antd";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { getProfiles } from "../features/auth/authSlice";

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profiles } = useSelector((state) => state.auth);
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mobileView, setMobileView] = useState(window.innerWidth < 768);
  const [tabletView, setTabletView] = useState(window.innerWidth < 992);

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  useEffect(() => {
    dispatch(getProfiles());
  }, [dispatch]);

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      const isTablet = window.innerWidth < 992;
      setMobileView(isMobile);
      setTabletView(isTablet);
      if (isMobile || isTablet) setCollapsed(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNavigation = (key) => {
    setLoading(true);
    setTimeout(() => {
      if (key === "signout") {
        localStorage.clear();
        window.location.reload();
      } else {
        navigate(key);
      }
      setLoading(false);
      if (mobileView || tabletView) setDrawerVisible(false);
    }, 400);
  };

  const notificationMenu = (
    <Menu
      items={[
        { key: "1", label: "New order received" },
        { key: "2", label: "Low stock alert" },
        { key: "3", label: "Invoice generated" },
      ]}
    />
  );

  const menuItems = [
    { key: "", icon: <AiOutlineDashboard />, label: "Dashboard" },
    {
      key: "Catalog",
      icon: <AiOutlineShoppingCart />,
      label: "Catalog",
      children: [
        { key: "product", label: "Product" },
        { key: "brand", label: "Brand" },
        { key: "category", label: "Category" },
        { key: "subcategory", label: "SubCategory" },
        { key: "tax", label: "Tax" },
        { key: "unit", label: "Units" },
      ],
    },
    {
      key: "Category",
      icon: <BiCategoryAlt />,
      label: "Category",
      children: [
        { key: "expance", label: "Expense Category" },
        { key: "Salestype", label: "Sales Category" },
      ],
    },
    { key: "orders", icon: <FaClipboardList />, label: "Sales Report" },
    { key: "customers", icon: <AiOutlineUser />, label: "Customers" },
    { key: "create-logins", icon: <AiOutlineLogin />, label: "Login" },
    { key: "coupon", icon: <RiCouponLine />, label: "Marketing" },
    { key: "profile", icon: <FaStore />, label: "Store" },
    { key: "signout", icon: <AiOutlineLogout />, label: "Sign Out" },
  ];

  // Inline styles
  const styles = {
    layout: {
      minHeight: "100vh",
      backgroundColor: "#f5f5f5",
    },
    sider: {
      boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
      zIndex: 1000,
      background: "#fff",
    },
    logo: {
      height: "64px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 16px",
      borderBottom: "1px solid #f0f0f0",
      background: "#fff",
      fontSize: "18px",
      fontWeight: "bold",
      color: "#1890ff",
    },
    menu: {
      borderRight: "none",
      padding: "8px 0",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0 16px",
      background: "#fff",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      position: "sticky",
      top: 0,
      zIndex: 999,
      height: "64px",
    },
    headerLeft: {
      display: "flex",
      alignItems: "center",
    },
    headerRight: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    trigger: {
      fontSize: "18px",
      cursor: "pointer",
      transition: "color 0.3s",
      padding: "8px",
      borderRadius: "6px",
    },
    button: {
      borderRadius: "6px",
      fontWeight: "500",
      border: "none",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    addButton: {
      background: "#52c41a",
      color: "#fff",
    },
    posButton: {
      background: "#1890ff",
      color: "#fff",
    },
    headerIcon: {
      fontSize: "18px",
      color: "#666",
      cursor: "pointer",
      padding: "8px",
      borderRadius: "6px",
      transition: "all 0.3s",
    },
    profileBox: {
      display: "flex",
      alignItems: "center",
      padding: "4px 8px",
      borderRadius: "8px",
      cursor: "pointer",
      transition: "all 0.3s",
      minWidth: mobileView ? "auto" : "120px",
    },
    profileImage: {
      borderRadius: "50%",
      objectFit: "cover",
    },
    profileName: {
      marginLeft: "8px",
      fontSize: "14px",
      fontWeight: "500",
      color: "#333",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      maxWidth: mobileView ? "0" : "100px",
    },
    content: {
      margin: mobileView ? "0" : "16px",
      padding: mobileView ? "12px" : "16px",
      borderRadius: mobileView ? "0" : "8px",
      minHeight: "calc(100vh - 96px)",
      background: colorBgContainer,
      boxShadow: mobileView ? "none" : "0 2px 8px rgba(0,0,0,0.1)",
    },
    drawer: {
      zIndex: 1001,
    },
    drawerBody: {
      padding: 0,
    },
    menuItem: {
      margin: "4px 0",
    },
    loadingSpinner: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "200px",
    },
  };

  return (
    <Layout style={styles.layout}>
      {/* Sidebar for desktop and tablet */}
      {!mobileView && (
        <Sider
          width={tabletView ? 200 : 250}
          trigger={null}
          collapsible
          collapsed={collapsed}
          style={styles.sider}
        >
          <div style={styles.logo}>
            {!collapsed && (
              <span style={{ 
                fontSize: tabletView ? "16px" : "18px",
                fontWeight: "bold"
              }}>
                MapTag
              </span>
            )}
          </div>
          <Menu
            theme="light"
            mode="inline"
            style={styles.menu}
            defaultSelectedKeys={[""]}
            onClick={({ key }) => handleNavigation(key)}
            items={menuItems}
          />
        </Sider>
      )}

      <Layout>
        {/* Header */}
        <Header style={styles.header}>
          <div style={styles.headerLeft}>
            {mobileView ? (
              <Button
                type="text"
                icon={<MenuFoldOutlined />}
                onClick={() => setDrawerVisible(true)}
                style={styles.trigger}
              />
            ) : (
              React.createElement(
                collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
                {
                  style: styles.trigger,
                  onClick: () => setCollapsed(!collapsed),
                }
              )
            )}
          </div>

          <div style={styles.headerRight}>
            {!mobileView && (
              <>
                <Button 
                  style={{ ...styles.button, ...styles.addButton }}
                  className="dreams-btn add"
                >
                  Add New
                </Button>
                <Button 
                  style={{ ...styles.button, ...styles.posButton }}
                  className="dreams-btn pos"
                >
                  POS
                </Button>
              </>
            )}
            
            <Dropdown overlay={notificationMenu} placement="bottomRight">
              <Badge count={3} offset={[-2, 6]}>
                <BellOutlined 
                  style={{
                    ...styles.headerIcon,
                    fontSize: mobileView ? "16px" : "18px"
                  }} 
                />
              </Badge>
            </Dropdown>

            <Dropdown
              menu={{
                items: [
                  {
                    key: "signout",
                    label: (
                      <Link onClick={() => handleNavigation("signout")}>
                        Sign Out
                      </Link>
                    ),
                  },
                ],
              }}
              placement="bottomRight"
            >
              <div style={styles.profileBox}>
                <img
                  src="https://stroyka-admin.html.themeforest.scompiler.ru/variants/ltr/images/customers/customer-4-64x64.jpg"
                  alt="profile"
                  style={styles.profileImage}
                  width={32}
                  height={32}
                />
                {!mobileView && (
                  <span style={styles.profileName}>
                    {profiles?.[0]?.storeName || "User"}
                  </span>
                )}
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Mobile Drawer */}
        {mobileView && (
          <Drawer
            title={
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "8px",
                fontSize: "16px",
                fontWeight: "bold"
              }}>
                <div style={styles.logo}>MapTag</div>
              </div>
            }
            placement="left"
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            width={280}
            bodyStyle={styles.drawerBody}
            style={styles.drawer}
          >
            <Menu
              theme="light"
              mode="inline"
              onClick={({ key }) => handleNavigation(key)}
              items={menuItems}
              style={styles.menu}
            />
          </Drawer>
        )}

        <Spin 
          spinning={loading} 
          style={styles.loadingSpinner}
          size="large"
        >
          <Content style={styles.content}>
            <ToastContainer 
              autoClose={250} 
              position="top-right"
              style={{
                fontSize: mobileView ? "12px" : "14px"
              }}
            />
            <Outlet />
          </Content>
        </Spin>
      </Layout>
    </Layout>
  );
};

export default MainLayout;