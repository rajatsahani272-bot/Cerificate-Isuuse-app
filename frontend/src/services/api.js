import axios from "axios";

const API = axios.create({
  baseURL: "https://cerificate-isuuse-app.onrender.com/api",
  withCredentials: true,
});

export default API;