const getTokenFromLocalStorage = localStorage.getItem("pos")
  ? JSON.parse(localStorage.getItem("pos"))
  : null;

export const config = {
  headers: {
    Authorization: `Bearer ${
      getTokenFromLocalStorage !== null ? getTokenFromLocalStorage.token : ""
    }`,
    Accept: "application/json",
  },
};
