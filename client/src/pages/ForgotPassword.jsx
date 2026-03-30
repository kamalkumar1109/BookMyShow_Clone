import React, { useEffect } from "react";
import { Button, Card, Form, Input, Typography, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import useHttp from "../hooks/useHttp";
import { forgotPassword } from "../lib/apis";

const { Title, Text } = Typography;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { data, error, isLoading, sendRequest } = useHttp(forgotPassword, false);

  useEffect(() => {
    if (!data || error) return;
    message.success(
      "If the email exists, a reset link has been sent. Please check your inbox.",
    );
    navigate("/signin");
  }, [data, error, navigate]);

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 0",
      }}
    >
      <Card
        style={{
          width: 420,
          backgroundColor: "#1f2533",
          borderRadius: 12,
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}
        bordered={false}
      >
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ padding: 0, color: "#69b1ff", marginBottom: 8 }}
        >
          Back
        </Button>

        <Title level={3} style={{ color: "#fff", marginTop: 0 }}>
          Forgot password
        </Title>
        <Text style={{ color: "#aab2c0", display: "block", marginBottom: 20 }}>
          Enter your email and we’ll send you a reset link.
        </Text>

        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => sendRequest({ email: values.email })}
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

          {error && (
            <Text style={{ color: "#ff4d4f", display: "block", marginBottom: 12 }}>
              {String(error)}
            </Text>
          )}

          <Button
            type="primary"
            htmlType="submit"
            block
            loading={isLoading}
            style={{ fontWeight: 600, marginTop: 8 }}
          >
            Send reset link
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default ForgotPassword;

