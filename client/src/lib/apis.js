import axios from "axios";

const BASE_URL = 'http://localhost:8080';

function getAuthHeaders() {
  const raw = localStorage.getItem("token");
  const token = typeof raw === "string" ? raw.trim() : "";
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export const fetchMovies = async () => {
  const res = await axios.get(`${BASE_URL}/movies`);
  return res.data;
}

export const fetchMovieById = async (id) => {
  const res = await axios.get(`${BASE_URL}/movies/${id}`);
  return res.data;
};

export const registerUser = async(newUser) => {
    const res = await axios.post(`${BASE_URL}/register`, newUser);
    return res.data;
}

export const loginUser = async(userCreds) => {
const res = await axios.post(`${BASE_URL}/login`, userCreds);
    return res.data;
}
export const fetchProfile = async() => {
const res = await axios.get(`${BASE_URL}/profile`, {
  headers: {
    ...getAuthHeaders(),
  }
});
    return res.data;
}

export const createTheatre = async (theatreData) => {
  const res = await axios.post(
    `${BASE_URL}/theatres`,
    theatreData,
    {
      headers: {
        ...getAuthHeaders(),
      },
    },
  );
  return res.data;
};

export const fetchTheatres = async () => {
  const res = await axios.get(`${BASE_URL}/theatres`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  return res.data;
};

export const fetchTheatreById = async (id) => {
  const res = await axios.get(`${BASE_URL}/theatres/${id}`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  return res.data;
};

export const createScreening = async (screeningData) => {
  const res = await axios.post(`${BASE_URL}/screenings`, screeningData, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  return res.data;
};

export const fetchTheatresByMovieId = async (movieId) => {
  const res = await axios.get(`${BASE_URL}/screenings/${movieId}`);
  return res.data;
};

export const fetchMyBookings = async () => {
  const res = await axios.get(`${BASE_URL}/bookings/me`, {
    headers: { ...getAuthHeaders() },
  });
  return res.data;
};

/** Public: which seat codes are taken for this screening (paid or active unpaid hold). */
export const fetchSeatOccupancy = async ({ theatreId, movieId, showTime }) => {
  const res = await axios.get(`${BASE_URL}/bookings/seat-occupancy`, {
    params: {
      theatreId,
      movieId,
      showTime,
    },
  });
  return res.data;
};

export const createBooking = async (bookingData) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Please sign in to confirm your booking");
  }
  const res = await axios.post(`${BASE_URL}/bookings`, bookingData, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  return res.data;
};

export const createCheckoutPayment = async ({
  amount,
  bookingId,
  currency = "inr",
  ticketCount,
}) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Please sign in to pay");
  }
  const res = await axios.post(
    `${BASE_URL}/payments`,
    { amount, bookingId, currency, ticketCount },
    { headers: { ...getAuthHeaders() } },
  );
  return res.data;
};

export const confirmPaymentSession = async ({ sessionId }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Please sign in");
  }
  const res = await axios.post(
    `${BASE_URL}/payments/confirm`,
    { sessionId },
    { headers: { ...getAuthHeaders() } },
  );
  return res.data;
};

export const forgotPassword = async ({ email }) => {
  const res = await axios.post(`${BASE_URL}/forgot-password`, { email });
  return res.data;
};

export const resetPassword = async ({ token, password }) => {
  const res = await axios.post(`${BASE_URL}/reset-password`, { token, password });
  return res.data;
};