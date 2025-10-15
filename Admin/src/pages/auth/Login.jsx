import React, { useEffect } from "react";
import { Card, Form, Input, Button, Typography, Image, Spin, Alert } from "antd";
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../features/auth/authSlice";
const { Title, Text } = Typography;

let schema = yup.object().shape({
  email: yup
    .string()
    .email("Email should be valid")
    .required("Email is Required"),
  password: yup.string().required("Password is Required"),
});
const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: schema,
    onSubmit: (values) => {
      dispatch(login(values));
    },
  });
  const authState = useSelector((state) => state);

  const { user, isError, isSuccess, isLoading, message } = authState.auth;

  useEffect(() => {
    if (isSuccess) {
      window.location.href = "/admin";
    } else {
      navigate("");
    }
  }, [user, isError, isSuccess, isLoading]);
  return (
    <>
<div className="login-page" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(to bottom, #003366 0%, #ff99cc 100%)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      padding: '20px'
    }}>
      <div style={{
          padding: '20px',
          textAlign: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h1 style={{ 
            fontSize: '36px', 
            color: '#fff',
            margin: 0,
            fontFamily:'Tempus Sans ITC',
            fontWeight: 'bold',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>Mapit</h1>
        </div>

      <Card
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'transparent',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(4px)',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
          borderRadius: 10,
          overflow: 'hidden'
        }}
        bodyStyle={{ padding: 0, background: 'transparent' }}
      >
    
                
        {/* Card Body */}
        <div style={{ padding: '30px 40px' }}>
          <Title level={1} style={{ textAlign: 'center', marginBottom: 30, color: '#fff', fontSize: 24 }}>Sign In</Title>
          {authState.isError && (
            <Alert
              message="Login Failed"
              description={authState.message || "Invalid credentials"}
              type="error"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}
          
          <Form layout="vertical" onFinish={formik.handleSubmit}>
            <Form.Item
              label={<span style={{ color: '#fff' }}>User Name</span>}
              validateStatus={formik.touched.email && formik.errors.email ? "error" : ""}
              help={formik.touched.email && formik.errors.email}
              style={{ marginBottom: 30 }}
            >
              <div style={{ position: 'relative' }}>
                <Input
                  prefix={<UserOutlined style={{ color: 'rgba(255,255,255,0.7)' }} />}
                  placeholder="Email id"
                  size="large"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  style={{
                    width: '100%',
                    height: 50,
                    background: 'transparent',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 40,
                    color: '#fff',
                    padding: '0 20px 0 40px'
                  }}
                />
              </div>
            </Form.Item>
            
            <Form.Item
              label={<span style={{ color: '#fff' }}>Password</span>}
              validateStatus={formik.touched.password && formik.errors.password ? "error" : ""}
              help={formik.touched.password && formik.errors.password}
              style={{ marginBottom: 30 }}
            >
              <div style={{ position: 'relative' }}>
                <Input
                  prefix={<LockOutlined style={{ color: 'rgba(255,255,255,0.7)' }} />}
                  placeholder="Enter Password"
                  size="large"
                  name="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  style={{
                    width: '100%',
                    height: 50,
                    background: 'transparent',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 40,
                    color: '#fff',
                    padding: '0 20px 0 40px'
                  }}
                />
              </div>
            </Form.Item>
            
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                style={{ 
                  height: 45,
                  background: '#fff',
                  border: 'none',
                  borderRadius: 40,
                  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                  color: '#333',
                  fontWeight: 600,
                  fontSize: 16
                }}
              >
                {authState.isLoading ? <Spin /> : 'Login'}
              </Button>
            </Form.Item>
            
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <Text style={{ color: '#fff', fontSize: 14.5 }}>
                Create Account? <a href="http://localhost:5173/register" style={{ color: '#fff', fontWeight: 600 }}>Sign UP</a>
              </Text>
            </div>
          </Form>
        </div>
      </Card>
    </div>
    </>
  );
};

export default Login;
