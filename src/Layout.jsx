import React from "react";
import "./Layout.css";

const Layout = ({ children }) => {
  return (
    <div className="layout layout-shell">
      {children}
    </div>
  );
};

export default Layout;
