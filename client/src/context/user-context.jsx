import React, { createContext, useEffect, useState } from "react";
import { message } from "antd";
import useHttp from "../hooks/useHttp";
import { fetchProfile, loginUser } from "../lib/apis";
import { useNavigate } from "react-router";

const UserContext = createContext({
  user: null,
  isAuthenticated: false,
  authLoading: true,
  login: () => {},
  logout: () => {},
});

export const UserContextProvider = (props) => {
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  const { data, error, isLoading, sendRequest } = useHttp(loginUser, false);

  useEffect(() => {
    if (isLoading || data) return;
    if (error) {
      message.error("Email or password is incorrect.");
    }
  }, [isLoading, data, error]);

  const {
    data: profile,
    error: profileError,
    isLoading: isProfileLoading,
    sendRequest: sendFetchProfile,
  } = useHttp(fetchProfile, true);

  useEffect(() => {
    if (!isLoading && data) {
      localStorage.setItem("token", data.token);
      sendFetchProfile();
      navigate("/");
    }
  }, [data]);
  useEffect(() => {
    if (!isProfileLoading && profile) {
      setUser(profile);
    }
  }, [profile, isProfileLoading]);

  useEffect(() => {
    sendFetchProfile();
  }, []);

  const login = (userCreds) => {
    sendRequest(userCreds);
  };
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const context = {
    user: user,
    isAuthenticated: !!user,
    authLoading: isProfileLoading,
    login: login,
    logout: logout,
  };
  return (
    <UserContext.Provider value={context}>
      {props.children}
    </UserContext.Provider>
  );
};

export default UserContext;
