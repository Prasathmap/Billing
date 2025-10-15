import React from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useFormik } from "formik";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../features/auth/authSlice"; 

const { Title } = Typography;

const loginSchema = yup.object().shape({
  phone: yup
    .string()
    .required("Phone is required")
    .matches(/^[0-9]+$/, "Only numbers are allowed")
    .min(10, "Minimum 10 digits"),
  password: yup.string().required("Password is required"),
});

const Login = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  const formik = useFormik({
    initialValues: {
      phone: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      dispatch(login(values));
    },
  });

  return (
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

      <Card  style={{
          width: '100%',
          maxWidth: 420,
          background: 'transparent',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(4px)',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
          borderRadius: 10,
          overflow: 'hidden'
        }}
        bodyStyle={{ padding: 0, background: 'transparent' }}>
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
            label="Phone"
            validateStatus={formik.touched.phone && formik.errors.phone ? "error" : ""}
            help={formik.touched.phone && formik.errors.phone}
          >
            <Input
              prefix={<UserOutlined style={{ color: 'rgba(255,255,255,0.7)' }} />}
              name="phone"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter phone number"
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
          </Form.Item>

          <Form.Item
            label="Password"
            validateStatus={formik.touched.password && formik.errors.password ? "error" : ""}
            help={formik.touched.password && formik.errors.password}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: 'rgba(255,255,255,0.7)' }} />}
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter password"
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
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
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
        </Form>
        </div>
      </Card>
    </div>
  );
};

export default Login;
