import socket from "socket.io-client";

let socketInstance = null;

export const initializeSocket = (projectId) => {
  // --- FIX: Prevent re-initializing if socket already exists ---
  if (socketInstance) {
    console.warn("Socket instance already exists.");
    // Just return the existing instance
    return socketInstance;
  }
  // --- END FIX ---

  console.log("Initializing socket for project:", projectId);
  socketInstance = socket(import.meta.env.VITE_API_URL, {
    auth: {
      token: localStorage.getItem("token"),
    },
    query: {
      projectId, // Pass projectId in query
    },
  });

  socketInstance.on("connect", () => {
    console.log("Socket minimally connected:", socketInstance.id);
  });

  socketInstance.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
  });

  return socketInstance;
};

export const recieveMessage = (eventName, cb) => {
  if (!socketInstance) {
    console.error("Cannot receive message: Socket not initialized.");
    return; // Guard clause if socket not initialized
  }

  socketInstance.on(eventName, cb);

  // --- FIX: Return a cleanup function ---
  // This allows React's useEffect to remove the listener on unmount
  return () => {
    console.log(`Removing listener for: ${eventName}`);
    socketInstance.off(eventName, cb);
  };
  // --- END FIX ---
};

export const sendMessage = (eventName, data) => {
  if (!socketInstance) {
    console.error("Cannot send message: Socket not initialized.");
    return; // Guard clause
  }

  socketInstance.emit(eventName, data);
};

// --- ADDED: A function to properly disconnect the socket ---
export const disconnectSocket = () => {
  if (socketInstance) {
    console.log("Disconnecting socket...");
    socketInstance.disconnect();
    socketInstance = null;
  }
};
