import React from "react";
import { Form, Input, InputNumber, Button, Card, Typography, message } from "antd";
import { useNavigate } from "react-router";
import { createTheatre } from "../lib/apis";
import useHttp from "../hooks/useHttp";

const { Title, Paragraph } = Typography;

const CreateTheatre = () => {
  const navigate = useNavigate();
  const { isLoading, error, sendRequest } = useHttp(createTheatre, false);

  const onFinish = async (values) => {
    await sendRequest(values);
    if (!error) {
      message.success("Theatre created successfully");
      navigate("/");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "24px auto" }}>
      <Card
        style={{
          backgroundColor: "#1f2533",
          borderRadius: 12,
        }}
        bodyStyle={{ padding: 24 }}
      >
        <Title level={3} style={{ color: "#fff", marginBottom: 8 }}>
          Create Theatre
        </Title>
        <Paragraph style={{ color: "#cfd3dc", marginBottom: 24 }}>
          Enter theatre details to add a new venue.
        </Paragraph>

        <Form
          layout="vertical"
          onFinish={onFinish}
          disabled={isLoading}
        >
          <Form.Item
            label={<span style={{ color: "#fff" }}>Name</span>}
            name="name"
            rules={[{ required: true, message: "Please enter theatre name" }]}
          >
            <Input placeholder="PVR Cinemas" />
          </Form.Item>

          <Form.Item
            label={<span style={{ color: "#fff" }}>Address</span>}
            name="address"
            rules={[{ required: true, message: "Please enter address" }]}
          >
            <Input.TextArea rows={3} placeholder="Full address" />
          </Form.Item>

          <Form.Item
            label={<span style={{ color: "#fff" }}>Contact Number</span>}
            name="contactNo"
            rules={[{ required: true, message: "Please enter contact number" }]}
          >
            <Input placeholder="9876543210" />
          </Form.Item>

          <Form.Item
            label={<span style={{ color: "#fff" }}>Capacity</span>}
            name="capacity"
            rules={[{ required: true, message: "Please enter total seats" }]}
          >
            <InputNumber
              min={1}
              style={{ width: "100%" }}
              placeholder="Number of seats"
            />
          </Form.Item>

          {error && (
            <Paragraph style={{ color: "#ff4d4f" }}>
              Failed to create theatre. {String(error)}
            </Paragraph>
          )}

          <Form.Item>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Button onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={isLoading}>
                Create Theatre
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateTheatre;

