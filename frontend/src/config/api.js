const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000";

console.log("Resolved API_BASE_URL:", API_BASE_URL);

export default API_BASE_URL;
