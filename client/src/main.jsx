import { createRoot } from "react-dom/client";
import "./index.css";
import "antd/dist/reset.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router";
import { UserContextProvider } from "./context/user-context.jsx";


createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <UserContextProvider>
      <App />
    </UserContextProvider>
  </BrowserRouter>,
);
