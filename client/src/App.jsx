import React from "react";
import Layout from "./components/Layout";
import { Route, Routes } from "react-router";
import AllMovies from "./pages/AllMovies";
import MovieDetails from "./pages/MovieDetails";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import CreateTheatre from "./pages/CreateTheatre";
import AllTheatres from "./pages/AllTheatres";
import TheatreDetails from "./pages/TheatreDetails";
import Checkout from "./pages/Checkout";
import PaymentReturn from "./pages/PaymentReturn";
import MyBookings from "./pages/MyBookings";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<AllMovies />} />
        <Route path="/movies/:id" element={<MovieDetails />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment-return" element={<PaymentReturn />} />
        <Route path="/bookings" element={<MyBookings />} />
        <Route path="/theatres" element={<AllTheatres />} />
        <Route path="/theatres/new" element={<CreateTheatre />} />
        <Route path="/theatres/:id" element={<TheatreDetails />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </Layout>
  );
};

export default App;
