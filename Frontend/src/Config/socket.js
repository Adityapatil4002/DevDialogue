import { io } from "socket.io-client";

let socketInstance = null;

export const initializeSocket = (projectId) => {
  if (socketInstance) return socketInstance;

  // Fetch the token from localStorage and send it via the auth payload
  socketInstance = io(
    import.meta.env.VITE_API_URL || "https://devdialogue.onrender.com",
    {
      auth: {
        token: localStorage.getItem("devdialogue_token") || "",
      },
      query: { projectId },
    },
  );

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
