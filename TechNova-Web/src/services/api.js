import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8001",   // FastAPI URL
  timeout: 600000,
});

export default API;
