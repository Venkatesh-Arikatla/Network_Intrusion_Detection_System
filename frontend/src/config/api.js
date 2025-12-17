// Always resolve backend from where the frontend is opened
const hostname = window.location.hostname || "localhost";

// Force http because Flask is running on http
const API_BASE_URL = `http://${hostname}:8000`;

console.log("Resolved API_BASE_URL:", API_BASE_URL);

export default API_BASE_URL;
