import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import useHttp from "../hooks/useHttp";
import { createScreening, fetchMovies, fetchTheatreById } from "../lib/apis";
import {
  Button,
  Card,
  Divider,
  Empty,
  Form,
  Input,
  InputNumber,
  Select,
  Skeleton,
  Typography,
  message,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const TheatreDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, error, isLoading, sendRequest } = useHttp(
    fetchTheatreById,
    true,
  );

  const [form] = Form.useForm();

  const {
    data: movies,
    error: moviesError,
    isLoading: isMoviesLoading,
    sendRequest: sendMoviesRequest,
  } = useHttp(fetchMovies, false);

  const {
    data: createdScreening,
    error: createError,
    isLoading: isCreating,
    sendRequest: sendCreateScreeningRequest,
  } = useHttp(createScreening, false);

  useEffect(() => {
    if (!id) return;
    sendRequest(id);
  }, [id]);

  useEffect(() => {
    sendMoviesRequest();
  }, []);

  useEffect(() => {
    if (createdScreening) {
      message.success("Screening created successfully");
      form.resetFields();
    }
  }, [createdScreening]);

  if (isLoading) {
    return (
      <div style={{ padding: "24px 0" }}>
        <Skeleton active />
      </div>
    );
  }

  if (!isLoading && error) {
    return (
      <div style={{ padding: "24px 0" }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Back
        </Button>
        <Divider />
        <Text style={{ color: "#ff4d4f" }}>
          Failed to load theatre details. {String(error)}
        </Text>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: "24px 0" }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Back
        </Button>
        <Divider />
        <Empty description="Theatre not found" />
      </div>
    );
  }

  const { _id: theatreId, name, address, contactNo, capacity } = data;

  return (
    <div style={{ padding: "24px 0", color: "#fff" }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
        Back
      </Button>
      <Divider style={{ borderColor: "#2b3245" }} />

      <Card
        style={{
          backgroundColor: "#1f2533",
          borderRadius: 12,
        }}
        bodyStyle={{ padding: 24 }}
      >
        <Title level={3} style={{ marginTop: 0, color: "#fff" }}>
          {name}
        </Title>

        <div style={{ color: "#cfd3dc" }}>
          <div style={{ marginBottom: 12 }}>
            <Text style={{ color: "#aab2c0" }}>Address: </Text>
            {address}
          </div>
          <div style={{ marginBottom: 12 }}>
            <Text style={{ color: "#aab2c0" }}>Contact: </Text>
            {contactNo}
          </div>
          <div>
            <Text style={{ color: "#aab2c0" }}>Capacity: </Text>
            {capacity}
          </div>
        </div>
      </Card>

      <div style={{ marginTop: 24 }}>
        <Card
          style={{
            backgroundColor: "#1f2533",
            borderRadius: 12,
            color: "#fff",
          }}
          bodyStyle={{ padding: 24 }}
        >
          <Title level={4} style={{ marginTop: 0, color: "#fff" }}>
            Create Screening
          </Title>

          <Form
            form={form}
            layout="vertical"
            onFinish={(values) => {
              const showTimingsArr = String(values.showTimings || "")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);

              if (showTimingsArr.length === 0) {
                message.error("Please enter at least one show timing");
                return;
              }

              sendCreateScreeningRequest({
                theatreId,
                movieId: values.movieId,
                price: values.price,
                showTimings: showTimingsArr,
              });
            }}
            disabled={isCreating || isMoviesLoading}
          >
            <Form.Item
              label={<span style={{ color: "#fff" }}>Movie</span>}
              name="movieId"
              rules={[{ required: true, message: "Please select a movie" }]}
            >
              <Select
                placeholder="Select a movie"
                loading={isMoviesLoading}
                options={(movies || []).map((m) => ({
                  value: m._id,
                  label: m.title,
                }))}
              />
            </Form.Item>

            <Form.Item
              label={<span style={{ color: "#fff" }}>Price</span>}
              name="price"
              rules={[{ required: true, message: "Please enter price" }]}
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                placeholder="e.g. 250"
              />
            </Form.Item>

            <Form.Item
              label={<span style={{ color: "#fff" }}>Show Timings</span>}
              name="showTimings"
              rules={[
                {
                  required: true,
                  message: "Please enter show timings (comma separated)",
                },
              ]}
            >
              <Input
                placeholder="e.g. 10:30 AM, 2:30 PM"
                disabled={isCreating || isMoviesLoading}
              />
            </Form.Item>

            {createError && (
              <Text style={{ color: "#ff4d4f" }}>
                Failed to create screening. {String(createError)}
              </Text>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Button
                onClick={() => form.resetFields()}
                disabled={isCreating}
              >
                Reset
              </Button>
              <Button type="primary" htmlType="submit" loading={isCreating}>
                Create Screening
              </Button>
            </div>

            {moviesError && (
              <Text style={{ color: "#ff4d4f" }}>
                Failed to load movies. {String(moviesError)}
              </Text>
            )}
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default TheatreDetails;

