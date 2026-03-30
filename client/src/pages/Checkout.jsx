import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { Button, Typography, Spin, Alert, Card } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import UserContext from "../context/user-context";
import { createCheckoutPayment } from "../lib/apis";
import { stripePromise } from "../lib/stripeClient";
import { CHECKOUT_DRAFT_KEY } from "../lib/checkoutDraft";

const { Title, Text, Paragraph } = Typography;

/**
 * Stripe EmbeddedCheckoutProvider must receive a stable `fetchClientSecret`.
 * Read booking from sessionStorage so the callback identity never changes.
 */
function readCheckoutDraft() {
  try {
    const raw = sessionStorage.getItem(CHECKOUT_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, authLoading } = useContext(UserContext);
  const [draft, setDraft] = useState(null);
  const [checkoutError, setCheckoutError] = useState(null);

  const summary = useMemo(() => {
    if (!draft) return null;
    const amount = Number(draft.amount);
    const ticketCount =
      typeof draft.ticketCount === "number" && draft.ticketCount > 0
        ? draft.ticketCount
        : 1;
    const pricePerTicket =
      typeof draft.pricePerTicket === "number" && !Number.isNaN(draft.pricePerTicket)
        ? draft.pricePerTicket
        : ticketCount > 0
          ? amount / ticketCount
          : amount;
    return {
      amount,
      ticketCount,
      pricePerTicket,
    };
  }, [draft]);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate("/signin", { replace: true, state: { from: "/checkout" } });
      return;
    }

    let next = location.state;
    if (!next?.bookingId) {
      next = readCheckoutDraft();
    }

    if (!next?.bookingId) {
      navigate("/", { replace: true });
      return;
    }

    setDraft(next);
    sessionStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(next));
  }, [isAuthenticated, authLoading, location.state, navigate]);

  const fetchClientSecret = useCallback(async () => {
    setCheckoutError(null);
    const d = readCheckoutDraft();
    if (!d?.bookingId) {
      const err = new Error(
        "Missing booking. Go back to the movie page and confirm seats again.",
      );
      setCheckoutError(err.message);
      throw err;
    }
    try {
      const res = await createCheckoutPayment({
        amount: d.amount,
        bookingId: d.bookingId,
        currency: d.currency || "inr",
        ticketCount:
          typeof d.ticketCount === "number" && d.ticketCount > 0
            ? d.ticketCount
            : undefined,
      });
      const secret = res.payload?.clientSecret;
      if (!secret) {
        const msg = res.message || "Could not start checkout";
        setCheckoutError(msg);
        throw new Error(msg);
      }
      return secret;
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Payment could not be started";
      setCheckoutError(String(msg));
      throw err;
    }
  }, []);

  if (authLoading) {
    return (
      <Card
        style={{
          maxWidth: 480,
          margin: "48px auto",
          background: "#1f2533",
          borderColor: "#2b3245",
        }}
      >
        <div style={{ textAlign: "center", padding: 24 }}>
          <Spin size="large" />
          <Paragraph style={{ color: "#cfd3dc", marginTop: 16, marginBottom: 0 }}>
            Checking your session…
          </Paragraph>
        </div>
      </Card>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ color: "#fff", padding: "24px 0" }}>
        <Text>Redirecting to sign in…</Text>
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div style={{ color: "#fff", padding: "24px 0", maxWidth: 560 }}>
        <Alert
          type="warning"
          showIcon
          message="Stripe publishable key missing"
          description='Set VITE_STRIPE_PUBLISHABLE_KEY in client/.env and restart Vite.'
        />
        <Button
          style={{ marginTop: 16 }}
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
      </div>
    );
  }

  if (!draft) {
    return (
      <Card
        style={{
          maxWidth: 480,
          margin: "48px auto",
          background: "#1f2533",
          borderColor: "#2b3245",
        }}
      >
        <div style={{ textAlign: "center", padding: 24 }}>
          <Spin size="large" />
          <Paragraph style={{ color: "#cfd3dc", marginTop: 16, marginBottom: 0 }}>
            Preparing checkout…
          </Paragraph>
        </div>
      </Card>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-page-inner">
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() =>
            navigate(draft.movieId ? `/movies/${draft.movieId}` : "/")
          }
          style={{ color: "#69b1ff", padding: 0, marginBottom: 20, height: "auto" }}
        >
          Back to movie
        </Button>

        <Title level={2} style={{ color: "#fff", marginTop: 0, marginBottom: 8 }}>
          Complete payment
        </Title>
        <Text
          style={{
            color: "#aab2c0",
            display: "block",
            marginBottom: 24,
            fontSize: 15,
          }}
        >
          {draft.movieTitle}
          {draft.theatreName ? ` · ${draft.theatreName}` : ""}
        </Text>

        {summary && (
          <div className="checkout-order-summary">
            <Text
              style={{
                color: "#aab2c0",
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                display: "block",
                marginBottom: 12,
              }}
            >
              Order summary
            </Text>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div>
                <Text style={{ color: "#cfd3dc", fontSize: 15 }}>
                  ₹{Number(summary.pricePerTicket).toFixed(0)} ×{" "}
                  {summary.ticketCount} ticket
                  {summary.ticketCount === 1 ? "" : "s"}
                </Text>
              </div>
              <div>
                <Text style={{ color: "#fff", fontSize: 22, fontWeight: 700 }}>
                  ₹{Number(summary.amount).toFixed(0)}{" "}
                  <span style={{ fontSize: 14, fontWeight: 500, color: "#aab2c0" }}>
                    {String(draft.currency || "inr").toUpperCase()}
                  </span>
                </Text>
              </div>
            </div>
          </div>
        )}

        {checkoutError && (
          <Alert
            type="error"
            showIcon
            closable
            onClose={() => setCheckoutError(null)}
            message="Checkout could not load"
            description={checkoutError}
            style={{ marginBottom: 20 }}
          />
        )}

        <div
          id="checkout"
          className="stripe-embedded-checkout-wrap"
        >
          <EmbeddedCheckoutProvider
            key={`${draft.bookingId}-${draft.amount}`}
            stripe={stripePromise}
            options={{ fetchClientSecret }}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
