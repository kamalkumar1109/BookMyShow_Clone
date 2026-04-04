import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router";
import { Card, List, Typography, Tag } from "antd";
import useHttp from "../hooks/useHttp";
import { fetchTheatres } from "../lib/apis";
import UserContext from "../context/user-context";

const { Title, Text, Paragraph } = Typography;

const AllTheatres = () => {
  const navigate = useNavigate();
  const { isAuthenticated, authLoading } = useContext(UserContext);
  const { data, error, isLoading, sendRequest } = useHttp(fetchTheatres, true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate("/signin", { replace: true });
      return;
    }
    sendRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once after auth resolves
  }, [authLoading, isAuthenticated]);

  return (
    <div style={{ padding: "24px 0" }}>
      <Title level={3} style={{ color: "#fff", marginBottom: 16 }}>
        All Theatres
      </Title>

      {authLoading && <Text style={{ color: "#ccc" }}>Loading session...</Text>}

      {isLoading && (
        <Text style={{ color: "#ccc" }}>Loading theatres...</Text>
      )}

      {!isLoading && error && (
        <Text style={{ color: "#ff4d4f" }}>
          Failed to load theatres. {String(error)}
        </Text>
      )}

      {!isLoading && !error && (
        <>
          {data && data.length > 0 ? (
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
              dataSource={data}
              renderItem={(theatre) => (
                <List.Item key={theatre._id}>
                  <Card
                    hoverable
                    style={{
                      borderRadius: 12,
                      backgroundColor: "#1f2533",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                    onClick={() => navigate(`/theatres/${theatre._id}`)}
                  >
                    <Title
                      level={4}
                      style={{ color: "#fff", marginBottom: 4 }}
                    >
                      {theatre.name}
                    </Title>
                    <Paragraph
                      style={{
                        color: "#cfd3dc",
                        marginBottom: 8,
                        minHeight: 40,
                      }}
                    >
                      {theatre.address}
                    </Paragraph>
                    <div style={{ marginBottom: 4 }}>
                      <Text style={{ color: "#aab2c0" }}>
                        Contact: {theatre.contactNo}
                      </Text>
                    </div>
                    <Tag color="geekblue" style={{ marginTop: 8 }}>
                      Capacity: {theatre.capacity}
                    </Tag>
                  </Card>
                </List.Item>
              )}
            />
          ) : (
            <Text style={{ color: "#ccc" }}>No theatres to display.</Text>
          )}
        </>
      )}
    </div>
  );
};

export default AllTheatres;

