import React from "react";
import { Form, Input, Button, Card, Typography } from "antd";
import UserContext from "../context/user-context";
import { useContext } from "react";
import { useNavigate } from "react-router";

const { Title, Text } = Typography;

const SignIn = () => {
  const [form] = Form.useForm();
  const { login } = useContext(UserContext);
  const navigate = useNavigate();

  const handleFinish = (values) => {
   login(values);
  };

  return (
    <div
      className="bms-auth-page"
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Card
        className="bms-auth-card"
        style={{
          width: 400,
          backgroundColor: "#1f2533",
          borderRadius: 8,
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}
        bordered={false}
      >
        <Title level={3} style={{ color: "#fff", textAlign: "center", marginBottom: 8 }}>
          Sign in
        </Title>
        <Text style={{ color: "#aaa", display: "block", textAlign: "center", marginBottom: 24 }}>
          Welcome back! Please enter your details to continue.
        </Text>

        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            label={<span style={{ color: "#ddd" }}>Email</span>}
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input placeholder="you@example.com" />
          </Form.Item>

          <Form.Item
            label={<span style={{ color: "#ddd" }}>Password</span>}
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password placeholder="Enter your password" />
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              style={{ fontWeight: 600 }}
            >
              Sign in
            </Button>
          </Form.Item>

          <div style={{ marginTop: 12, textAlign: "right" }}>
            <Button
              type="link"
              style={{ padding: 0, color: "#69b1ff" }}
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default SignIn;

