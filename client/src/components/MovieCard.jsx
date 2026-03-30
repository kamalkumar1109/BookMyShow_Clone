import React from "react";
import { Card, Rate, Tag } from "antd";
import { useNavigate } from "react-router";

const { Meta } = Card;

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const { title, posterUrl, rating, genre } = movie;

  return (
    <Card
      hoverable
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/movies/${movie._id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter") navigate(`/movies/${movie._id}`);
      }}
      cover={
        <img
          alt={title}
          src={posterUrl}
          style={{ height: 320, width: "100%", objectFit: "cover" }}
        />
      }
      style={{
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: "#1f2533",
        cursor: "pointer",
      }}
      bodyStyle={{ padding: 12 }}
    >
      <Meta
        title={title}
        style={{ color: "#fff" }}
        description={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#fff", fontWeight: 600 }}>
                {typeof rating === "number" ? rating.toFixed(1) : rating}
              </span>
              {typeof rating === "number" && (
                <Rate
                  allowHalf
                  disabled
                  defaultValue={rating / 2}
                  style={{ fontSize: 12 }}
                />
              )}
            </div>
            {genre && (
              <Tag color="magenta" style={{ margin: 0 }}>
                {genre}
              </Tag>
            )}
          </div>
        }
      />
    </Card>
  );
};

export default MovieCard;

