import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Outlet, useNavigate } from "react-router-dom";
import { Layout, Menu, theme, Spin, Button, Drawer, Grid } from "antd";
import { MenuOutlined } from "@ant-design/icons";

const { Header, Content } = Layout;
const { useBreakpoint } = Grid;

const PosLayout = () => {
  const [loading, setLoading] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const screens = useBreakpoint();
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const navigate = useNavigate();

  const handleNavigation = (key) => {
    setMobileMenuVisible(false);
    setLoading(true);
    setTimeout(() => {
      if (key === "signout") {
        localStorage.clear();
        window.location.reload();
      } else {
        navigate(key);
      }
      setLoading(false);
    }, 500);
  };

  const menuItems = [
    { key: "", label: "Dashboard" },
    { key: "sales", label: "Sales" },
    { key: "sales-Report", label: "Sales Report" },
    { key: "expance", label: "Expense" },
    { key: "dayclose", label: "Day Close" },
    { key: "signout", label: "Sign Out", danger: true },
  ];

  const fixedWindowStyle = {
    width: "100%",
    maxWidth: "1800px",
    margin: "0 auto",
    minHeight: "100vh",
    backgroundColor: colorBgContainer,
    boxShadow: screens.md ? "0 0 20px rgba(0,0,0,0.1)" : "none",
    position: "relative",
    overflowX: "hidden"
  };

  return (
    <div style={fixedWindowStyle}>
      <Spin spinning={loading} wrapperClassName="content-spinner">
        <Layout>
          <Header
            style={{
              background: colorBgContainer,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 24px",
              height: "64px",
              position: "sticky",
              top: 0,
              zIndex: 1,
              width: "100%",
              borderBottom: "1px solid #f0f0f0"
            }}
          >
            <div style={{
              textAlign: 'center',
              borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <h1 style={{ 
                fontSize: '22px', 
                color: 'rgba(134, 0, 244, 0.96)',
                margin: 0,
                fontFamily:'Tempus Sans ITC',
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}>Mapit</h1>
            </div>

            {screens.md ? (
              <Menu
                theme="light"
                mode="horizontal"
                onClick={({ key }) => handleNavigation(key)}
                items={menuItems}
                style={{ 
                  flex: 1, 
                  minWidth: 0, 
                  justifyContent: "flex-end",
                  borderBottom: "none",
                  lineHeight: "62px"
                }}
              />
            ) : (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setMobileMenuVisible(true)}
                style={{ fontSize: "16px" }}
              />
            )}
          </Header>

          <Drawer
            title="Menu"
            placement="right"
            onClose={() => setMobileMenuVisible(false)}
            open={mobileMenuVisible}
            width={250}
            bodyStyle={{ padding: 0 }}
          >
            <Menu
              mode="inline"
              onClick={({ key }) => handleNavigation(key)}
              items={menuItems}
              style={{ borderRight: "none", padding: "8px 0" }}
            />
          </Drawer>

          <Content
            style={{
              padding: screens.md ? "24px" : "16px",
              minHeight: "calc(100vh - 64px)",
            }}
          >
            <ToastContainer
              position="top-right"
              autoClose={2500}
              hideProgressBar={false}
              newestOnTop={true}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              theme="light"
              style={{ marginTop: "64px" }}
            />
            <Outlet />
          </Content>
        </Layout>
      </Spin>
    </div>
  );
};

export default PosLayout;