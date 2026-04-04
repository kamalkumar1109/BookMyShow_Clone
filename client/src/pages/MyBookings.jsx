import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Typography,
  Table,
  Button,
  Tag,
  Empty,
  Skeleton,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import useHttp from "../hooks/useHttp";
import { fetchMyBookings } from "../lib/apis";

const { Title, Text } = Typography;

const MyBookings = () => {
  const navigate = useNavigate();
  const { data, error, isLoading, sendRequest } = useHttp(fetchMyBookings, true);

  useEffect(() => {
    sendRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount
  }, []);

  const bookings = data?.bookings ?? [];

  const columns = [
    {
      title: "Movie",
      key: "movie",
      render: (_, record) => (
        <Text style={{ color: "#fff" }}>
          {record.movie?.title ?? "—"}
        </Text>
      ),
    },
    {
      title: "Theatre",
      key: "theatre",
      render: (_, record) => (
        <span style={{ color: "#cfd3dc" }}>
          {record.theatre?.name ?? "—"}
        </span>
      ),
    },
    {
      title: "Show time",
      dataIndex: "showTime",
      key: "showTime",
      render: (t) => <span style={{ color: "#cfd3dc" }}>{t ?? "—"}</span>,
    },
    {
      title: "Seats",
      dataIndex: "seats",
      key: "seats",
      render: (seats) => (
        <Text style={{ color: "#cfd3dc" }}>
          {Array.isArray(seats) && seats.length ? seats.join(", ") : "—"}
        </Text>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (a) => (
        <Text style={{ color: "#fff" }}>
          {a != null ? `₹${Number(a).toFixed(0)}` : "—"}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (s) => {
        if (s === "paid") {
          return <Tag color="success">Paid</Tag>;
        }
        if (s === "pending") {
          return <Tag color="warning">Pending payment</Tag>;
        }
        return <Tag color="default">Booked</Tag>;
      },
    },
    {
      title: "",
      key: "action",
      width: 120,
      render: (_, record) => {
        const mid = record.movie?._id || record.movie;
        if (!mid) return null;
        return (
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/movies/${mid}`)}
            style={{ padding: 0 }}
          >
            View movie
          </Button>
        );
      },
    },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "8px 0 32px" }}>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ color: "#69b1ff", padding: 0, marginBottom: 16 }}
      >
        Back
      </Button>

      <Title level={2} style={{ color: "#fff", marginTop: 0 }}>
        My bookings
      </Title>
      <Text style={{ color: "#aab2c0", display: "block", marginBottom: 24 }}>
        All bookings linked to your account.
      </Text>

      {isLoading && (
        <Skeleton active paragraph={{ rows: 6 }} />
      )}

      {!isLoading && error && (
        <Text style={{ color: "#ff4d4f" }}>{String(error)}</Text>
      )}

      {!isLoading && !error && bookings.length === 0 && (
        <Empty
          description={<span style={{ color: "#aab2c0" }}>No bookings yet</span>}
        />
      )}

      {!isLoading && !error && bookings.length > 0 && (
        <div className="bms-table-scroll">
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={bookings}
            pagination={{ pageSize: 8 }}
            style={{ background: "transparent" }}
            className="my-bookings-table"
          />
        </div>
      )}
    </div>
  );
};

export default MyBookings;
