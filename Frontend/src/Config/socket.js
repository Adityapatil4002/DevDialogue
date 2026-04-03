import { io } from "socket.io-client";

let socketInstance = null;

export const initializeSocket = (projectId) => {
  if (socketInstance) return socketInstance;

  // Better Auth uses cookies — withCredentials sends them automatically
  // No manual token needed in the auth handshake
  socketInstance = io(import.meta.env.VITE_API_URL || "http://localhost:4000", {
    withCredentials: true, // ✅ Sends the session cookie to the socket server
    query: { projectId },
  });

  socketInstance.on("connect", () => {
    console.log("✅ Socket connected:", socketInstance.id);
  });

  socketInstance.on("connect_error", (error) => {
    console.error("❌ Socket connection error:", error.message);
  });

  return socketInstance;
};

export const recieveMessage = (eventName, cb) => {
  if (!socketInstance) return;
  socketInstance.on(eventName, cb);
  return () => socketInstance.off(eventName, cb);
};

export const sendMessage = (eventName, data) => {
  if (!socketInstance) return;
  socketInstance.emit(eventName, data);
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
