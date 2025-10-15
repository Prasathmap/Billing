import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const PrivateRoutes = ({ children }) => {
  const navigate = useNavigate();
  const getTokenFromLocalStorage = JSON.parse(localStorage.getItem("pos"));

  useEffect(() => {
    if (!getTokenFromLocalStorage?.token) {
      navigate("/", { replace: true });
    }
  }, [getTokenFromLocalStorage, navigate]);

  return getTokenFromLocalStorage?.token ? children : null;
};