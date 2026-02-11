import React from "react";
import { useLocation } from "react-router-dom";
import "./Layout.css";
import Chatbot from "./Chatbot";

const Layout = ({ children }) => {
  const location = useLocation();

  const hideChatbotRoutes = ["/", "/login", "/signup"]; // auth pages
  const shouldShowChatbot = !hideChatbotRoutes.includes(location.pathname);

  return (
    <div className="layout layout-shell">
      <main className="main-content" role="main">
        {children}
      </main>
      {shouldShowChatbot && <Chatbot />}
    </div>
  );
};

export default Layout;
