import { io } from "socket.io-client";

// ⚠️ Make sure this URL matches your backend (port 5000 by default)
const socket = io("http://localhost:5000");

export default socket;
