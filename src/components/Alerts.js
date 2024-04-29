import { useState, useEffect } from "react";
import React from "react";
import "../assets/Styles/alert.css";

const Alerts = ({ message, type, timeout = 3000 }) => {
  const [showAlert, setAlert] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleCloseAlrt();
    }, timeout);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCloseAlrt = () => {
    setAlert(false);
  };

  return (
    showAlert && (
      <div className={`alert ${type}`}>
        <span className="closebtn" onClick={handleCloseAlrt}>
          &times;
        </span>
        {message}
      </div>
    )
  );
};

export default Alerts;
