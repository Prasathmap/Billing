import React, { useState, useRef, useEffect } from "react";
import { Form, Button, Layout, Typography, Modal, Select, Radio } from "antd";
import stateData from "../../data/pincode_IN.json";
import { useFormik } from "formik";
import * as yup from "yup";
import CustomInput from "../../components/CustomInput";
import axios from "axios";
import { config } from "../../utils/axiosconfig";
import { useDispatch } from "react-redux";
import { registerUser, sendOtp, verifyOtp } from "../../features/auth/authSlice";

const { Title, Text } = Typography;
const { Option } = Select;

// Form validation schema
const signUpSchema = yup.object({
  userName: yup.string().required("User Name is Required"),
  email: yup.string().required("Email is Required").email("Email should be valid"),
  emailOtp: yup.string().length(6, "OTP must be 6 digits").matches(/^\d{6}$/, "OTP must be numeric"),
  phone: yup.string().matches(/^\d{10}$/, "Enter a valid 10-digit phone number").required("Phone number is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  confirmPassword: yup.string().oneOf([yup.ref("password"), null], "Passwords must match").required("Confirm Password is required"),
});

// Custom hook for responsive design
const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};

const MultiStepForm = () => {
  const isMobile = useMobile();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [emailOtp, setEmailOtp] = useState(["", "", "", "", "", ""]);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState({ email: false });
  const [emailResendTime, setEmailResendTime] = useState(30);
  const inputRefs = useRef({});
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [paymentInfo, setPaymentInfo] = useState({
    razorpayPaymentId: "",
  });
  const plans = {
    monthly: { basic: "₹500/week" },
    yearly: { basic: "₹3000/month" },
  };
  
  const dispatch = useDispatch();
  const formik = useFormik({
    initialValues: {
      userName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      paymentInfo: "",
    },
    validationSchema: signUpSchema,
    onSubmit: async (values) => {
      // if (!otpVerified.email) {
      //   alert("Please verify your email OTP first.");
      //   return;
      // }
      dispatch(registerUser(values));
    },
  });

  // Function to send OTP
  const handleSendOTP = async (type) => {
    if (type === "email" && (!formik.values.email || formik.errors.email)) return;
    
    setLoading(true);
    try {
      if (type === "email") {
        await dispatch(sendOtp({ email: formik.values.email }));
        setEmailOtpSent(true);
        setEmailResendTime(30);
        alert("OTP sent to your email.");

        const interval = setInterval(() => {
          setEmailResendTime((prev) => {
            if (prev === 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      console.log(`Error sending OTP for ${type}.`);
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (type) => {
    const otpCode = emailOtp.join("").trim();

    if (otpCode.length !== 6) {
      alert("Enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const response = await dispatch(
        verifyOtp({
          [type]: formik.values[type],
          [`${type}Otp`]: otpCode,
        })
      );

      if (response.payload?.success) {
        setOtpVerified((prev) => ({ ...prev, [type]: true }));
        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} OTP Verified Successfully!`);
      } else {
        alert(response.payload?.message || "OTP Verification Failed.");
      }
    } catch (error) {
      console.error("OTP Verification Error:", error);
      alert("OTP Verification Failed due to an error.");
    }
    setLoading(false);
  };

  // Function to handle OTP input change
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...emailOtp];
    newOtp[index] = value;
    setEmailOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[`email-${index + 1}`]?.focus();
    }
  };

  // Handle backspace navigation
  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !emailOtp[index] && index > 0) {
      inputRefs.current[`email-${index - 1}`]?.focus();
    }
  }; 

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const checkOutHandler = async () => {
    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!res) {
      alert("Razorpay SDK failed to load");
      return;
    }

    if (!formik.values.subscription) {
      alert("Please select a subscription plan");
      return;
    }

    let amountString = plans[billingCycle][formik.values.subscription];
    let amount = parseInt(amountString.replace(/[^0-9]/g, ""), 10);

    const result = await axios.post(
      "http://localhost:4000/api/auth/order/checkout",
      { amount: amount },
      config
    );

    if (!result) {
      alert("Something went wrong");
      return;
    }

    const { amount: orderAmount, currency } = result.data.order;

    const options = {
      key: "rzp_test_QSZHdzxON8Fo45",
      amount: orderAmount,
      currency: currency,
      name: "Mapitonce",
      handler: async function (response) {
        const data = {
          razorpayPaymentId: response.razorpay_payment_id,
        };

        try {
          const verificationResult = await axios.post(
            "http://localhost:4000/api/auth/order/paymentVerification",
            data
          );

          if (verificationResult.data.success) {
            dispatch({
              type: "UPDATE_PAYMENT_INFO",
              payload: verificationResult.data,
            });

            formik.setFieldValue("paymentInfo", verificationResult.data);
            alert("Payment successful and saved.");
          } else {
            alert("Payment verification failed.");
          }
        } catch (error) {
          console.error("Error verifying payment:", error);
          alert("Payment verification request failed.");
        }
      },
      notes: {
        address: "Developer's corner office",
      },
      theme: {
        color: "#61dafb",
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  
  const next = () => {
    setCurrent((prev) => prev + 1);
  };
  
  const prev = () => setCurrent(current - 1);

  const steps = [
    {
      title: "Personal Info",
      content: (
        <>
          <Title level={isMobile ? 3 : 2}>Personal Info</Title>
          <Text type="secondary">Enter your personal details.</Text>
          <Form layout="vertical">
               <CustomInput
                  label="Name"
                  type="text"
                  name="userName"
                  id="userName"
                  placeholder="Name"
                  val={formik.values.userName}
                  onChng={formik.handleChange("userName")}
                  onBlr={formik.handleBlur("userName")}
                  style={{
                    width: "100%",
                    fontSize: isMobile ? "14px" : "16px",
                    padding: isMobile ? "10px 12px" : "12px 16px"
                  }}
                />
                <div className="error">
                  {formik.touched.userName && formik.errors.userName}
                </div>
                
                <CustomInput
                      label="Email"
                      name="email"
                      placeholder="Enter your email"
                      val={formik.values.email}
                      onChng={formik.handleChange}
                      onBlr={() => !emailOtpSent && handleSendOTP("email")}
                      icon={otpVerified.email ? (
                        <span style={{ color: "#10B981", marginLeft: "8px" }}>✓</span>
                      ) : null}
                      style={{
                        width: "100%",
                        fontSize: isMobile ? "14px" : "16px",
                        padding: isMobile ? "10px 12px" : "12px 16px"
                      }}
                    />

                    <div className="error" style={{ 
                      color: "#EF4444",
                      fontSize: "14px",
                      marginTop: "4px",
                      minHeight: "20px"
                    }}>
                      {formik.touched.email && formik.errors.email}
                    </div>

                    {emailOtpSent && (
                      <div style={{ 
                        marginTop: "16px",
                        padding: "16px",
                        backgroundColor: "#F8FAFC",
                        borderRadius: "8px",
                        border: "1px solid #E2E8F0"
                      }}>
                        <div style={{ 
                          display: "flex", 
                          justifyContent: "center", 
                          alignItems: "center", 
                          gap: isMobile ? "4px" : "8px",
                          marginBottom: "12px"
                        }}>
                          {emailOtp.map((digit, index) => (
                            <div key={index} style={{ position: "relative" }}>
                              <input
                                type="text"
                                maxLength="1"
                                value={digit}
                                ref={(el) => (inputRefs.current[`email-${index}`] = el)}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                readOnly={otpVerified.email}
                                style={{
                                  width: isMobile ? "36px" : "48px",
                                  height: isMobile ? "36px" : "48px",
                                  textAlign: "center",
                                  fontSize: isMobile ? "16px" : "18px",
                                  border: otpVerified.email 
                                    ? "2px solid #10B981" 
                                    : "2px solid #CBD5E1",
                                  borderRadius: "8px",
                                  backgroundColor: otpVerified.email ? "#ECFDF5" : "white",
                                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                                  transition: "all 0.2s ease",
                                  outline: "none",
                                }}
                              />
                              {otpVerified.email && index === emailOtp.length - 1 && (
                                <div style={{
                                  position: "absolute",
                                  right: "-8px",
                                  top: "-8px",
                                  backgroundColor: "#10B981",
                                  borderRadius: "50%",
                                  width: "20px",
                                  height: "20px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center"
                                }}>
                                  <svg width="12" height="12" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M16.6667 5L7.50001 14.1667L3.33334 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        <div style={{ 
                          display: "flex", 
                          justifyContent: "center",
                          gap: "12px",
                          alignItems: "center",
                          flexDirection: isMobile ? "column" : "row"
                        }}>
                          <Button
                            onClick={() => handleVerifyOTP("email")}
                            disabled={loading || otpVerified.email}
                            style={{
                              width: isMobile ? "100%" : "auto",
                              padding: "8px 16px",
                              backgroundColor: otpVerified.email 
                                ? "#D1FAE5" 
                                : loading 
                                  ? "#E0E7FF" 
                                  : "#4F46E5",
                              color: otpVerified.email 
                                ? "#065F46" 
                                : "white",
                              border: "none",
                              borderRadius: "6px",
                              fontWeight: "500",
                              cursor: loading || otpVerified.email ? "not-allowed" : "pointer",
                              transition: "all 0.2s ease",
                            }}
                          >
                            {loading ? (
                              <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-spin">
                                  <path d="M12 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M12 18V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M4.93 4.93L7.76 7.76" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M16.24 16.24L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M2 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M18 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M4.93 19.07L7.76 16.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Verifying...
                              </>
                            ) : otpVerified.email ? (
                              "Verified"
                            ) : (
                              "Verify OTP"
                            )}
                          </Button>

                          {emailResendTime > 0 ? (
                            <div style={{ 
                              color: "#64748B",
                              fontSize: "14px"
                            }}>
                              Resend in <span style={{ fontWeight: "600" }}>{emailResendTime}s</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleSendOTP("email")}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#4F46E5",
                                fontWeight: "500",
                                cursor: "pointer",
                                fontSize: "14px",
                                textDecoration: "underline",
                              }}
                            >
                              Resend OTP
                            </button>
                          )}
                        </div>
                      </div>
                    )}
               <CustomInput
                  type="tel"
                  label="Mobile"
                  name="phone"
                  placeholder="Mobile Number"
                  val={formik.values.phone}
                  onChng={formik.handleChange("phone")}
                  style={{
                    width: "100%",
                    fontSize: isMobile ? "14px" : "16px",
                    padding: isMobile ? "10px 12px" : "12px 16px"
                  }}
                />
                <div className="error">{formik.touched.phone && formik.errors.phone}</div>

          </Form>
        </>
      ),
    },
    
    {
      title: " Subscription Plan",
      content: (
        <> 
        <div>
      <Title level={isMobile ? 3 : 2}>Choose Your Subscription Plan</Title>
      <Form layout="vertical">
        <Form.Item label="Billing Cycle">
          <Radio.Group 
            onChange={(e) => setBillingCycle(e.target.value)} 
            value={billingCycle}
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: "16px"
            }}
          >
            <Radio value="monthly">Monthly</Radio>
            <Radio value="yearly">Yearly</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="Subscription Plan">
          <Radio.Group
            onChange={(e) => formik.setFieldValue("subscription", e.target.value)}
            value={formik.values.subscription}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px"
            }}
          >
            <Radio value="basic">Basic - {plans[billingCycle].basic}</Radio>
          </Radio.Group>
          <div className="error mt-2">{formik.touched.subscription && formik.errors.subscription}</div>
        </Form.Item>

        <Button 
          type="primary" 
          className="mt-4" 
          onClick={checkOutHandler}
          style={{
            width: "100%",
            height: "40px"
          }}
        >
          Subscribe
        </Button>
      </Form>
    </div>
        
        </>)
    },
    {
      title: "Set Password",
      content: (
        <>
          <Title level={isMobile ? 3 : 2}>Create Password</Title>
          <Form layout="vertical">
          <CustomInput
            type="password"
            label="Password"
            id="pass"
            name="password"
            onChng={formik.handleChange("password")}
            onBlr={formik.handleBlur("password")}
            val={formik.values.password}
            style={{
              width: "100%",
              fontSize: isMobile ? "14px" : "16px",
              padding: isMobile ? "10px 12px" : "12px 16px"
            }}
          />
          <div className="error mt-2">
            {formik.touched.password && formik.errors.password}
          </div>
          <CustomInput
            type="password"
            label="Confirm Password"
            id="confirmPassword"
            name="confirmPassword"
            onChng={formik.handleChange("confirmPassword")}
            onBlr={formik.handleBlur("confirmPassword")}
            val={formik.values.confirmPassword}
            style={{
              width: "100%",
              fontSize: isMobile ? "14px" : "16px",
              padding: isMobile ? "10px 12px" : "12px 16px"
            }}
          />
          <div className="error mt-2">
            {formik.touched.confirmPassword && formik.errors.confirmPassword}
          </div>
          </Form>
        </>
      ),
    }
  ];

  // Responsive styles
  const containerStyle = {
    minHeight: "100vh",
    backgroundColor: "#F0F4F8",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: isMobile ? "10px" : "20px"
  };

  const formContainerStyle = {
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    width: "100%",
    maxWidth: "1000px",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
  };

  const imageSectionStyle = {
    width: isMobile ? "100%" : "50%",
    height: isMobile ? "200px" : "auto",
    backgroundImage: "url('https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: isMobile ? "20px" : "40px",
    color: "white",
    position: "relative",
    "::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(79, 70, 229, 0.7)",
      zIndex: 1
    }
  };

  const formSectionStyle = {
    width: isMobile ? "100%" : "50%",
    background: "white",
    padding: isMobile ? "20px" : "40px"
  };

  return (
    <Layout style={containerStyle}>
      <div style={formContainerStyle}>
        {/* Image Section */}
        <div style={imageSectionStyle}>
          <div style={{ position: "relative", zIndex: 2 }}>
            <h2 style={{ fontSize: isMobile ? "22px" : "28px", fontWeight: "700",  marginBottom: "16px", textShadow: "0 2px 4px rgba(0,0,0,0.2)"}}>
              Welcome to Our Platform
            </h2>
            <p style={{ fontSize: isMobile ? "14px" : "16px",   lineHeight: "1.6", textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}>
              Join thousands of happy users who are already using our services to grow their business.
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div style={formSectionStyle}>
          <div style={{  marginBottom: isMobile ? "20px" : "30px", textAlign: "center" }}>
            <h2 style={{  fontSize: isMobile ? "20px" : "24px",  fontWeight: "600",  color: "#1E293B", marginBottom: "8px" }}>
              Signup
            </h2>
          </div>

          <form onSubmit={formik.handleSubmit}>
            <div style={{ marginBottom: isMobile ? "20px" : "30px", minHeight: "300px"}}>
              {steps[current].content}
            </div>

            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row",justifyContent: "space-between", gap: "15px"}}>
              {current > 0 && (
                <Button onClick={prev}  style={{ width: isMobile ? "100%" : "auto", padding: "12px", backgroundColor: "#F1F5F9", color: "#64748B", border: "none", borderRadius: "8px", fontWeight: "500", cursor: "pointer",transition: "all 0.2s ease", }} >
                  Back
                </Button>
              )}

              {current < steps.length - 1 ? (
                <Button 
                  type="primary" 
                  onClick={next}
                  style={{
                    width: isMobile ? "100%" : "auto", padding: "12px",background: "#4F46E5",color: "white",border: "none", borderRadius: "8px", fontWeight: "500", cursor: "pointer",transition: "all 0.2s ease",   
                  }}
                >
                  Continue
                </Button>
              ) : (
                <button
                  type="submit"
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "#10B981",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  Complete Registration
                </button>
              )}
            </div>
          </form>

          <div style={{ 
            marginTop: "20px", 
            textAlign: "center",
            fontSize: isMobile ? "12px" : "13px",
            color: "#64748B"
          }}>
            Already have an account? <a href="/" style={{ color: "#4F46E5" }}>Sign in</a>
          </div>
        </div>
      </div>

      <Modal 
        open={isModalVisible} 
        onOk={() => setIsModalVisible(false)} 
        onCancel={() => setIsModalVisible(false)}
        centered
        footer={null}
        bodyStyle={{ padding: "0" }}
        width={isMobile ? "90%" : "50%"}
      >
        <div style={{ padding: isMobile ? "20px" : "30px", textAlign: "center" }}>
          <div style={{ 
            width: isMobile ? "60px" : "80px", 
            height: isMobile ? "60px" : "80px", 
            backgroundColor: "#D1FAE5",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px"
          }}>
            <svg width={isMobile ? "30" : "40"} height={isMobile ? "30" : "40"} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 style={{ 
            fontSize: isMobile ? "18px" : "20px", 
            fontWeight: "600",
            marginBottom: "10px",
            color: "#1E293B"
          }}>
            Registration Successful!
          </h3>
          <p style={{ 
            color: "#64748B",
            marginBottom: "20px",
            fontSize: isMobile ? "14px" : "16px"
          }}>
            Your account has been created successfully. You can now login to your account.
          </p>
          <button
            onClick={() => setIsModalVisible(false)}
            style={{
              padding: "10px 20px",
              background: "#4F46E5",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
              width: isMobile ? "100%" : "auto"
            }}
          >
            Continue to Dashboard
          </button>
        </div>
      </Modal>
    </Layout>
  );
};

export default MultiStepForm;