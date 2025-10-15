import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const OpenRoutes = ({ children }) => {
  const navigate = useNavigate();
  const getTokenFromLocalStorage = JSON.parse(localStorage.getItem("user"));


  useEffect(() => {
    if (getTokenFromLocalStorage?.token) {
      navigate("/admin", { replace: true });
    }
    
  }, [getTokenFromLocalStorage, navigate]);
  
  return !getTokenFromLocalStorage?.token? children : null;

};