import React, { useEffect } from "react";
import { Form, Input, Select, Button, Card, Typography, message } from "antd";
import { useNavigate } from "react-router";
import { registerUser } from "../lib/apis";
import useHttp from "../hooks/useHttp";

const { Title, Text } = Typography;
const { Option } = Select;

const SignUp = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const { data, isLoading, error, sendRequest } = useHttp(registerUser, false);

  const handleFinish = (values) => {
    sendRequest(values);
  };

  useEffect(() => {
    if (data && !error) {
      message.success("Registered successfully! Please sign in.");
      navigate("/signin");
    }
  }, [data, error, navigate]);

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Card
        style={{
          width: 400,
          backgroundColor: "#1f2533",
          borderRadius: 8,
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}
        bordered={false}
      >
        <Title level={3} style={{ color: "#fff", textAlign: "center", marginBottom: 8 }}>
          Create an account
        </Title>
        <Text style={{ color: "#aaa", display: "block", textAlign: "center", marginBottom: 24 }}>
          Register to book and manage your shows.
        </Text>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{ role: "User" }}
        >
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
            rules={[
              { required: true, message: "Please enter your password" },
              { min: 6, message: "Password should be at least 6 characters" },
            ]}
          >
            <Input.Password placeholder="Enter a secure password" />
          </Form.Item>

          <Form.Item
            label={<span style={{ color: "#ddd" }}>Role</span>}
            name="role"
            rules={[{ required: true, message: "Please select a role" }]}
          >
            <Select>
              <Option value="User">User</Option>
              <Option value="Partner">Partner</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              style={{ fontWeight: 600 }}
            >
              Sign up
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SignUp;

