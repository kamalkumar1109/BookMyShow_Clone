import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router";
import {
  Row,
  Col,
  Typography,
  Rate,
  Tag,
  Divider,
  Avatar,
  Button,
  Skeleton,
  Empty,
  List,
  Modal,
  message,
  Select,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import useHttp from "../hooks/useHttp";
import {
  createBooking,
  fetchMovieById,
  fetchSeatOccupancy,
  fetchTheatresByMovieId,
} from "../lib/apis";
import UserContext from "../context/user-context";

const { Title, Paragraph, Text } = Typography;

const MovieDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAuthenticated, authLoading } = useContext(UserContext);

  const { data, error, isLoading, sendRequest } = useHttp(fetchMovieById, true);

  const {
    data: theatresPayload,
    error: theatresError,
    isLoading: theatresLoading,
    sendRequest: sendTheatresRequest,
  } = useHttp(fetchTheatresByMovieId, false);

  const {
    data: bookingPayload,
    error: bookingError,
    isLoading: isBookingLoading,
    sendRequest: sendBookingRequest,
    reset: resetBooking,
  } = useHttp(createBooking, false);

  const bookingSuccessHandledRef = useRef(false);

  const [seatModalOpen, setSeatModalOpen] = useState(false);
  const [activeTheatre, setActiveTheatre] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedShowTime, setSelectedShowTime] = useState("");
  const [bookedSeats, setBookedSeats] = useState([]);

  const loadSeatOccupancy = useCallback(async () => {
    const theatreId = activeTheatre?._id;
    if (!theatreId || !id || !selectedShowTime) return;
    try {
      const res = await fetchSeatOccupancy({
        theatreId,
        movieId: id,
        showTime: selectedShowTime,
      });
      const list = res.payload?.bookedSeats;
      setBookedSeats(Array.isArray(list) ? list : []);
    } catch {
      setBookedSeats([]);
    }
  }, [activeTheatre?._id, id, selectedShowTime]);

  useEffect(() => {
    if (!seatModalOpen || !activeTheatre || !selectedShowTime) return undefined;
    loadSeatOccupancy();
    const interval = setInterval(loadSeatOccupancy, 30000);
    return () => clearInterval(interval);
  }, [seatModalOpen, activeTheatre, selectedShowTime, loadSeatOccupancy]);

  useEffect(() => {
    setSelectedSeats((prev) => prev.filter((s) => !bookedSeats.includes(s)));
  }, [bookedSeats]);

  useEffect(() => {
    if (!id) return;
    sendRequest(id);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    sendTheatresRequest(id);
  }, [id]);

  useEffect(() => {
    if (!seatModalOpen || !bookingPayload || isBookingLoading) return;
    if (bookingSuccessHandledRef.current) return;
    bookingSuccessHandledRef.current = true;

    const theatreName = activeTheatre?.name ?? "";
    const bookingId =
      bookingPayload._id != null ? String(bookingPayload._id) : "";
    const amount = Number(bookingPayload.amount);
    const seatCount =
      Array.isArray(bookingPayload.seats) && bookingPayload.seats.length > 0
        ? bookingPayload.seats.length
        : 1;
    const pricePerTicket =
      seatCount > 0 && !Number.isNaN(amount) ? amount / seatCount : amount;

    if (!bookingId) {
      message.error("Booking reference missing");
      resetBooking();
      bookingSuccessHandledRef.current = false;
      return;
    }

    message.success("Booking created. Continue to payment.");
    setSeatModalOpen(false);
    setActiveTheatre(null);
    setSelectedSeats([]);
    setSelectedShowTime("");
    resetBooking();

    navigate("/checkout", {
      state: {
        bookingId,
        amount: Number.isNaN(amount) ? 0 : amount,
        currency: "inr",
        movieTitle: data?.title,
        theatreName,
        movieId: id,
        ticketCount: seatCount,
        pricePerTicket: Number.isNaN(pricePerTicket) ? amount : pricePerTicket,
      },
    });
  }, [
    seatModalOpen,
    bookingPayload,
    isBookingLoading,
    activeTheatre,
    data,
    id,
    navigate,
    resetBooking,
  ]);

  if (isLoading) {
    return (
      <div style={{ padding: "24px 0" }}>
        <Skeleton active />
      </div>
    );
  }

  if (!isLoading && error) {
    return (
      <div style={{ padding: "24px 0", color: "#fff" }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Back
        </Button>
        <Divider />
        <Text style={{ color: "#ff4d4f" }}>
          Failed to load movie details. {String(error)}
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
        <Empty description="Movie not found" />
      </div>
    );
  }

  const {
    title,
    posterUrl,
    runtime,
    rating,
    description,
    cast = [],
    genre,
  } = data;

  const seatRows = ["A", "B", "C", "D", "E", "F"];
  const seatCols = Array.from({ length: 9 }, (_, i) => i + 1);

  const openBookingModal = (theatre) => {
    bookingSuccessHandledRef.current = false;
    resetBooking();
    setBookedSeats([]);
    setActiveTheatre(theatre);
    setSelectedSeats([]);
    setSelectedShowTime(
      Array.isArray(theatre?.showTimings) && theatre.showTimings.length
        ? theatre.showTimings[0]
        : "",
    );
    setSeatModalOpen(true);
  };

  const toggleSeat = (seatCode) => {
    if (bookedSeats.includes(seatCode)) return;
    setSelectedSeats((prev) => {
      if (prev.includes(seatCode)) return prev.filter((s) => s !== seatCode);
      return [...prev, seatCode];
    });
  };

  const onConfirmBooking = () => {
    if (authLoading) {
      message.info("Checking your session…");
      return;
    }
    if (!isAuthenticated) {
      message.error("Please sign in to confirm your booking");
      setSeatModalOpen(false);
      navigate("/signin");
      return;
    }
    if (!activeTheatre) {
      message.error("Please select a theatre first");
      return;
    }

    if (selectedSeats.length === 0) {
      message.error("Please select at least one seat");
      return;
    }

    const showTimings = Array.isArray(activeTheatre?.showTimings)
      ? activeTheatre.showTimings
      : [];
    if (!selectedShowTime) {
      message.error("Please select a show time");
      return;
    }

    const rawPrice = Number(activeTheatre.price);
    const pricePerTicket = Number.isNaN(rawPrice) ? 0 : rawPrice;
    if (pricePerTicket < 0) {
      message.error("Invalid price for this theatre");
      return;
    }

    const ticketCount = selectedSeats.length;
    const totalAmount = pricePerTicket * ticketCount;

    sendBookingRequest({
      theatreId: activeTheatre._id,
      movieId: id,
      amount: totalAmount,
      seats: selectedSeats,
      showTime: selectedShowTime,
    });
  };

  return (
    <div style={{ padding: "24px 0", color: "#fff" }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
        Back
      </Button>

      <Divider style={{ borderColor: "#2b3245" }} />

      <Row gutter={[24, 24]}>
        <Col xs={24} md={8} lg={6}>
          <div
            style={{
              width: "100%",
              borderRadius: 12,
              overflow: "hidden",
              background: "#1f2533",
            }}
          >
            <img
              src={posterUrl}
              alt={title}
              style={{ width: "100%", height: 420, objectFit: "cover" }}
            />
          </div>
        </Col>

        <Col xs={24} md={16} lg={18}>
          <Title level={2} style={{ marginTop: 0, color: "#fff" }}>
            {title}
          </Title>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {typeof rating === "number" && (
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Text style={{ color: "#fff", fontWeight: 600 }}>
                  {rating.toFixed(1)}
                </Text>
                <Rate
                  allowHalf
                  disabled
                  defaultValue={rating / 2}
                  style={{ fontSize: 14 }}
                />
              </span>
            )}
            {typeof runtime === "number" && (
              <Tag color="geekblue" style={{ margin: 0 }}>
                {runtime} mins
              </Tag>
            )}
            {genre && (
              <Tag color="magenta" style={{ margin: 0 }}>
                {genre}
              </Tag>
            )}
          </div>

          <Divider style={{ borderColor: "#2b3245" }} />

          <Title level={4} style={{ color: "#fff" }}>
            About the movie
          </Title>
          <Paragraph style={{ color: "#cfd3dc", fontSize: 14 }}>
            {description || "No description available."}
          </Paragraph>

          <Divider style={{ borderColor: "#2b3245" }} />

          <Title level={4} style={{ color: "#fff" }}>
            Cast
          </Title>
          {cast.length === 0 ? (
            <Text style={{ color: "#cfd3dc" }}>No cast info available.</Text>
          ) : (
            <Row gutter={[16, 16]}>
              {cast.map((member) => (
                <Col key={member._id || member.name} xs={24} sm={12} md={12} lg={8}>
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      padding: 12,
                      borderRadius: 12,
                      backgroundColor: "#1f2533",
                    }}
                  >
                    <Avatar
                      size={56}
                      src={member.profilePicture}
                      alt={member.name}
                    >
                      {member?.name?.[0]}
                    </Avatar>
                    <div style={{ minWidth: 0 }}>
                      <Text
                        style={{
                          color: "#fff",
                          fontWeight: 600,
                          display: "block",
                        }}
                        ellipsis
                      >
                        {member.name}
                      </Text>
                      {member.alias && (
                        <Text style={{ color: "#aab2c0" }} ellipsis>
                          as {member.alias}
                        </Text>
                      )}
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>

      <div style={{ marginTop: 24 }}>
        <Divider style={{ borderColor: "#2b3245" }} />

        <Title level={4} style={{ marginBottom: 16, color: "#fff" }}>
          Screening Theatres
        </Title>

        {theatresLoading && (
          <Text style={{ color: "#ccc" }}>Loading theatres...</Text>
        )}

        {!theatresLoading && theatresError && (
          <Text style={{ color: "#ff4d4f" }}>
            Failed to load theatres. {String(theatresError)}
          </Text>
        )}

        {!theatresLoading && !theatresError && (
          <>
            {theatresPayload && theatresPayload.length > 0 ? (
              <List
                grid={{
                  gutter: 24,
                  column: 3,
                  xs: 1,
                  sm: 1,
                  md: 2,
                  lg: 3,
                  xl: 3,
                }}
                dataSource={theatresPayload}
                renderItem={(theatre) => (
                  <List.Item key={theatre._id}>
                    <div
                      style={{
                        backgroundColor: "#1f2533",
                        borderRadius: 12,
                        padding: 16,
                        color: "#fff",
                        minHeight: 170,
                      }}
                    >
                      <Title
                        level={5}
                        style={{ margin: 0, color: "#fff", marginBottom: 8 }}
                      >
                        {theatre.name}
                      </Title>
                      <Text style={{ color: "#cfd3dc", display: "block" }}>
                        {theatre.address}
                      </Text>
                      <Text style={{ color: "#aab2c0", display: "block", marginTop: 8 }}>
                        Contact: {theatre.contactNo}
                      </Text>
                      <Text style={{ color: "#aab2c0", display: "block" }}>
                        Capacity: {theatre.capacity}
                      </Text>

                      <div style={{ marginTop: 12, textAlign: "right" }}>
                        <Button
                          type="primary"
                          onClick={() => openBookingModal(theatre)}
                        >
                          Book Ticket
                        </Button>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Text style={{ color: "#ccc" }}>No theatres found for this movie.</Text>
            )}
          </>
        )}
      </div>

      <Modal
        open={seatModalOpen}
        title={
          activeTheatre
            ? `Select Seats - ${activeTheatre.name}`
            : "Select Seats"
        }
        onCancel={() => {
          bookingSuccessHandledRef.current = false;
          resetBooking();
          setBookedSeats([]);
          setSeatModalOpen(false);
          setActiveTheatre(null);
          setSelectedSeats([]);
          setSelectedShowTime("");
        }}
        onOk={onConfirmBooking}
        okText="Confirm Booking"
        confirmLoading={isBookingLoading}
        okButtonProps={{
          disabled: selectedSeats.length === 0 || !selectedShowTime,
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <Text style={{ color: "#cfd3dc", display: "block", marginBottom: 6 }}>
            Movie: {data?.title}
          </Text>
          <div style={{ marginBottom: 6 }}>
            <Text style={{ color: "#aab2c0", display: "block", marginBottom: 6 }}>
              Show Time
            </Text>
            <Select
              style={{ width: "100%" }}
              value={selectedShowTime || undefined}
              placeholder="Select show time"
              onChange={(val) => setSelectedShowTime(val)}
              options={(Array.isArray(activeTheatre?.showTimings)
                ? activeTheatre.showTimings
                : []
              ).map((t) => ({
                value: t,
                label: t,
              }))}
            />
          </div>
          <div style={{ marginTop: 8 }}>
            <Text style={{ color: "#aab2c0", display: "block" }}>
              ₹{activeTheatre?.price ?? 0} per ticket
              {selectedSeats.length > 0
                ? ` · ${selectedSeats.length} ticket${selectedSeats.length === 1 ? "" : "s"} · Total ₹${(
                    Number(activeTheatre?.price ?? 0) * selectedSeats.length
                  ).toFixed(0)}`
                : ""}
            </Text>
          </div>
        </div>

        {bookingError && (
          <Text style={{ color: "#ff4d4f", display: "block", marginBottom: 12 }}>
            Failed to create booking. {String(bookingError)}
          </Text>
        )}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 12,
            alignItems: "center",
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                background: "#0f1014",
                border: "1px solid #2b3245",
              }}
            />
            <Text style={{ color: "#aab2c0", fontSize: 12 }}>Available</Text>
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                background: "#1890ff",
                border: "1px solid #1890ff",
              }}
            />
            <Text style={{ color: "#aab2c0", fontSize: 12 }}>Your selection</Text>
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                background: "#3d2a2a",
                border: "1px solid #a61d1d",
              }}
            />
            <Text style={{ color: "#aab2c0", fontSize: 12 }}>Booked / held</Text>
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: `40px repeat(${seatCols.length}, 34px)`,
            gap: 8,
            alignItems: "center",
            justifyContent: "start",
          }}
        >
          <div />
          {seatCols.map((c) => (
            <div
              key={`col-${c}`}
              style={{
                color: "#aab2c0",
                fontWeight: 600,
                textAlign: "center",
                fontSize: 12,
              }}
            >
              {c}
            </div>
          ))}

          {seatRows.map((row) => (
            <React.Fragment key={`row-${row}`}>
              <div
                style={{
                  color: "#aab2c0",
                  fontWeight: 700,
                  textAlign: "center",
                  fontSize: 12,
                }}
              >
                {row}
              </div>
              {seatCols.map((col) => {
                const seatCode = `${row}${col}`;
                const isBooked = bookedSeats.includes(seatCode);
                const isSelected = selectedSeats.includes(seatCode);
                return (
                  <button
                    key={seatCode}
                    type="button"
                    disabled={isBooked}
                    onClick={() => toggleSeat(seatCode)}
                    title={isBooked ? "Booked" : isSelected ? "Selected" : "Available"}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 6,
                      border: `1px solid ${
                        isBooked
                          ? "#a61d1d"
                          : isSelected
                            ? "#1890ff"
                            : "#2b3245"
                      }`,
                      backgroundColor: isBooked
                        ? "#3d2a2a"
                        : isSelected
                          ? "#1890ff"
                          : "#0f1014",
                      color: isBooked ? "#e8b4b4" : isSelected ? "#fff" : "#cfd3dc",
                      cursor: isBooked ? "not-allowed" : "pointer",
                      opacity: isBooked ? 0.92 : 1,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {seatCode}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        <div style={{ marginTop: 16 }}>
          <Text style={{ color: "#cfd3dc" }}>
            Selected seats: {selectedSeats.length ? selectedSeats.join(", ") : "None"}
          </Text>
        </div>
      </Modal>
    </div>
  );
};

export default MovieDetails;

