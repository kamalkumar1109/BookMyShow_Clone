import React, { useContext, useEffect, useState } from "react";
import {
  useNavigate,
  useSearchParams,
  Navigate,
} from "react-router";
import { Alert, Button, Spin, Typography, Descriptions } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { confirmPaymentSession } from "../lib/apis";
import UserContext from "../context/user-context";
import { CHECKOUT_DRAFT_KEY } from "../lib/checkoutDraft";

const { Title, Text, Paragraph } = Typography;

const PaymentReturn = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(UserContext);
  const sessionId = params.get("session_id");

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !sessionId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await confirmPaymentSession({ sessionId });
        if (!cancelled) {
          setData(res.payload ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          const msg =
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Something went wrong";
          setError(msg);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, sessionId]);

  useEffect(() => {
    if (data?.payment?.status === "PAID" && data?.paymentStatus === "paid") {
      sessionStorage.removeItem(CHECKOUT_DRAFT_KEY);
    }
  }, [data]);

  if (!isAuthenticated) {
    return (
      <div className="payment-return-page payment-return-page--narrow">
        <div style={{ color: "#fff", textAlign: "center", padding: "24px 0" }}>
          <Text>Please sign in to view payment status.</Text>
          <div style={{ marginTop: 16 }}>
            <Button type="primary" onClick={() => navigate("/signin")}>
              Sign in
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="payment-return-page">
        <div style={{ color: "#fff" }}>
          <Alert
            type="error"
            showIcon
            message="Missing payment session"
            description="No session_id was returned. Start again from your movie booking."
          />
          <div style={{ marginTop: 16, textAlign: "center" }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/")}
            >
              Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading && !data && !error) {
    return (
      <div className="payment-return-page">
        <div style={{ color: "#fff", padding: "48px 0", textAlign: "center" }}>
          <Spin size="large" />
          <Paragraph style={{ color: "#aab2c0", marginTop: 16 }}>
            Confirming payment with Stripe…
          </Paragraph>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-return-page">
        <div style={{ color: "#fff" }}>
          <Alert type="error" showIcon message="Could not confirm payment" description={error} />
          <div style={{ marginTop: 16, textAlign: "center" }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/checkout")}
            >
              Back to checkout
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { sessionStatus, paymentStatus, customerEmail, payment } = data;

  if (sessionStatus === "open") {
    return <Navigate to="/checkout" replace />;
  }

  const isPaid =
    paymentStatus === "paid" && payment?.status === "PAID";

  if (isPaid) {
    return (
      <div className="payment-return-page">
        <div style={{ textAlign: "center" }}>
          <Title level={3} style={{ color: "#52c41a", marginTop: 0 }}>
            Payment successful
          </Title>
          <Paragraph style={{ color: "#cfd3dc", marginBottom: 0 }}>
            Thank you. A confirmation may be sent to{" "}
            <strong style={{ color: "#fff" }}>
              {customerEmail || "your email on file"}
            </strong>
            .
          </Paragraph>
        </div>

        <Descriptions
          bordered
          size="small"
          column={1}
          style={{ marginTop: 24, background: "#1f2533" }}
          labelStyle={{ color: "#aab2c0", width: 160 }}
          contentStyle={{ color: "#fff" }}
        >
          <Descriptions.Item label="Transaction ID">
            {payment?.txnId ?? "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Amount">
            {payment?.amount != null ? String(payment.amount) : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Booking ID">
            {payment?.bookingId ?? "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Payment status">
            {payment?.status ?? "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Stripe session">
            {payment?.sessionId ?? sessionId}
          </Descriptions.Item>
          <Descriptions.Item label="Stripe payment_status">
            {paymentStatus}
          </Descriptions.Item>
          <Descriptions.Item label="Session status">
            {sessionStatus}
          </Descriptions.Item>
        </Descriptions>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Button type="primary" size="large" onClick={() => navigate("/")}>
            Back to movies
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-return-page">
      <div style={{ textAlign: "center" }}>
        <Title level={4} style={{ color: "#faad14", marginTop: 0 }}>
          Payment not completed
        </Title>
      </div>
      <Descriptions
        bordered
        size="small"
        column={1}
        style={{ background: "#1f2533" }}
        labelStyle={{ color: "#aab2c0", width: 160 }}
        contentStyle={{ color: "#fff" }}
      >
        <Descriptions.Item label="Session status">{sessionStatus}</Descriptions.Item>
        <Descriptions.Item label="Payment status">{paymentStatus}</Descriptions.Item>
        <Descriptions.Item label="Stored payment status">
          {payment?.status ?? "—"}
        </Descriptions.Item>
      </Descriptions>
      <div style={{ marginTop: 16, textAlign: "center" }}>
        <Button size="large" onClick={() => navigate("/checkout")}>
          Return to checkout
        </Button>
      </div>
    </div>
  );
};

export default PaymentReturn;
