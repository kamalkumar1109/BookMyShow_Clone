import React, { useContext } from "react";
import {
  Layout as AntLayout,
  Menu,
  Input,
  Button,
  Dropdown,
  Avatar,
} from "antd";
import { useNavigate } from "react-router";
import { UserOutlined } from "@ant-design/icons";
import UserContext from "../context/user-context";

const { Header, Content, Footer } = AntLayout;
const { Search } = Input;

const Layout = (props) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useContext(UserContext);

  const profileMenuItems = [
    {
      key: "email",
      disabled: true,
      label: <span style={{ fontWeight: 500 }}>Email: {user?.email}</span>,
    },
    {
      key: "role",
      disabled: true,
      label: <span>Role: {user?.role}</span>,
    },
    { type: "divider" },
    {
      key: "bookings",
      label: "My bookings",
    },
  ];

  return (
    <AntLayout style={{ minHeight: "100vh", backgroundColor: "#0f1014" }}>
      <Header className="bms-header">
        <div className="bms-header-left">
          <div
            className="bms-logo"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          >
            bookmyshow
          </div>
          <Menu
            mode="horizontal"
            theme="dark"
            selectedKeys={["movies"]}
            items={[{ key: "movies", label: "Movies" }]}
          />
        </div>
        <div className="bms-header-right">
          <Search placeholder="Search movies" allowClear className="bms-header-search" />
          {isAuthenticated &&
            (user?.role === "Partner" || user?.role === "Admin") && (
            <>
              <Button
                style={{ marginLeft: 12 }}
                onClick={() => navigate("/theatres")}
              >
                All Theatres
              </Button>
              <Button
                type="primary"
                style={{ marginLeft: 8 }}
                onClick={() => navigate("/theatres/new")}
              >
                Create Theatre
              </Button>
            </>
          )}
          {!isAuthenticated && (
            <>
              <Button
                style={{ marginLeft: 12 }}
                onClick={() => navigate("/signin")}
              >
                Sign in
              </Button>
              <Button
                type="primary"
                style={{ marginLeft: 8 }}
                onClick={() => navigate("/signup")}
              >
                Sign up
              </Button>
            </>
          )}
          {isAuthenticated && (
            <>
              <Dropdown
                menu={{
                  items: profileMenuItems,
                  onClick: ({ key }) => {
                    if (key === "bookings") navigate("/bookings");
                  },
                }}
                placement="bottomRight"
                trigger={["click"]}
              >
                <Avatar
                  style={{
                    marginLeft: 12,
                    cursor: "pointer",
                    backgroundColor: "#1890ff",
                  }}
                  icon={<UserOutlined />}
                />
              </Dropdown>
              <Button
                style={{ marginLeft: 8 }}
                onClick={() => {
                  logout();
                  navigate("/signin");
                }}
              >
                Logout
              </Button>
            </>
          )}
        </div>
      </Header>

      <Content
        className="bms-content-wrapper"
        style={{ padding: "24px 16px", backgroundColor: "#0f1014" }}
      >
        {props.children}
      </Content>

      <Footer className="bms-footer">
        © {new Date().getFullYear()} BookMyShow Clone. All rights reserved.
      </Footer>
    </AntLayout>
  );
};

export default Layout;
