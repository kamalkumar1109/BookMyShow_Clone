import React, { useState, useEffect } from "react";
import { Row, Col } from "antd";
import MovieCard from "../components/MovieCard";
import { fetchMovies } from "../lib/apis";
import useHttp from "../hooks/useHttp";

const AllMovies = () => {
  
  const { data, error, isLoading, sendRequest } = useHttp(fetchMovies, true);

  useEffect(() => {
    sendRequest();
  }, []);

  return (
    <div style={{ padding: "24px 0" }}>
      <h2
        style={{
          color: "#fff",
          fontSize: 24,
          fontWeight: 600,
          marginBottom: 24,
        }}
      >
        Trending Movies
      </h2>
      {isLoading && (
        <p style={{ color: "#ccc" }}>Loading movies...</p>
      )}

      {!isLoading && error && (
        <p style={{ color: "#ff4d4f" }}>
          Failed to load movies. {error?.message || "Please try again later."}
        </p>
      )}

      {!isLoading && !error && (
        <>
          {data && data.length > 0 ? (
            <Row gutter={[24, 32]}>
              {data.map((movie) => (
                <Col key={movie._id} xs={24} sm={12} md={8} lg={6} xl={6}>
                  <MovieCard movie={movie} />
                </Col>
              ))}
            </Row>
          ) : (
            <p style={{ color: "#ccc" }}>No movies to display.</p>
          )}
        </>
      )}
    </div>
  );
};

export default AllMovies;
