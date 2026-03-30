import React, { useEffect, useMemo } from "react";
import { Button, Card, Form, Input, Typography, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router";
import useHttp from "../hooks/useHttp";
import { resetPassword } from "../lib/apis";

const { Title, Text } = Typography;

const ResetPassword = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") || "";

  const [form] = Form.useForm();
  const { data, error, isLoading, sendRequest } = useHttp(resetPassword, false);

  const tokenMissing = useMemo(() => token.trim().length === 0, [token]);

  useEffect(() => {
    if (!data || error) return;
    message.success("Password reset successfully. Please sign in.");
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
          onClick={() => navigate("/signin")}
          style={{ padding: 0, color: "#69b1ff", marginBottom: 8 }}
        >
          Back to sign in
        </Button>

        <Title level={3} style={{ color: "#fff", marginTop: 0 }}>
          Reset password
        </Title>
        <Text style={{ color: "#aab2c0", display: "block", marginBottom: 20 }}>
          Choose a new password for your account.
        </Text>

        {tokenMissing && (
          <Text style={{ color: "#ff4d4f", display: "block", marginBottom: 12 }}>
            Reset token is missing. Please open the reset link from your email again.
          </Text>
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={(values) =>
            sendRequest({ token, password: values.password })
          }
        >
          <Form.Item
            label={<span style={{ color: "#ddd" }}>New password</span>}
            name="password"
            rules={[
              { required: true, message: "Please enter a new password" },
              { min: 6, message: "Password should be at least 6 characters" },
            ]}
          >
            <Input.Password placeholder="Enter a new password" />
          </Form.Item>

          <Form.Item
            label={<span style={{ color: "#ddd" }}>Confirm password</span>}
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Re-enter password" />
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
            disabled={tokenMissing}
            loading={isLoading}
            style={{ fontWeight: 600, marginTop: 8 }}
          >
            Reset password
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default ResetPassword;

