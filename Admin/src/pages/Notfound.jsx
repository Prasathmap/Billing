import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  const styles = {
    page404: {
      padding: "40px 0",
      background: "#fff",
      fontFamily: "'Arvo', serif",
      minHeight: "100vh",
    },
    container: {
      maxWidth: "1140px",
      margin: "0 auto",
      padding: "0 15px",
    },
    row: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      textAlign: "center",
    },
    fourZeroFourBg: {
      backgroundImage:
        "url(https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif)",
      height: "400px",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
    },
    h1: {
      fontSize: "80px",
    },
    contentBox404: {
      marginTop: "-50px",
    },
    h3: {
      fontSize: "24px",
      margin: "20px 0",
    },
    paragraph: {
      color: "#333",
      marginBottom: "20px",
    },
    link404: {
      color: "#fff",
      padding: "10px 20px",
      background: "#39ac31",
      display: "inline-block",
      textDecoration: "none",
      borderRadius: "5px",
      cursor: "pointer",
    },
  };

  return (
    <section style={styles.page404}>
      <div style={styles.container}>
        <div style={styles.row}>
          <div style={styles.fourZeroFourBg}>
            <h1 style={styles.h1}>404</h1>
          </div>

          <div style={styles.contentBox404}>
            <h3 style={styles.h3}>Look like you're lost</h3>
            <p style={styles.paragraph}>The page you are looking for is not available!</p>
            <span style={styles.link404} onClick={() => navigate("/")}>
              Go to Home
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotFound;
