import socket from "socket.io-client";

let socketInstance = null;

export const initializeSocket = (projectId) => {
  // Prevent creating multiple socket instances if already initialized
  if (socketInstance) {
    console.warn("Socket may already be initialized. Re-initializing.");
    // Consider disconnecting the old one if re-initialization is intentional
    // socketInstance.disconnect();
  }

  console.log("Initializing socket for project:", projectId);
  socketInstance = socket(import.meta.env.VITE_API_URL, {
    auth: {
      token: localStorage.getItem("token"),
    },
    query: {
      projectId, // Pass projectId in query
    },
  });

  // Minimal required listeners or logging if desired
  socketInstance.on("connect", () => {
    console.log("Socket minimally connected:", socketInstance.id);
  });

  socketInstance.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
  });

  return socketInstance;
};

// --- THIS IS THE MINIMAL FIX ---
export const recieveMessage = (eventName, cb) => {
  if (!socketInstance) {
    console.error("Cannot receive message: Socket not initialized.");
    return; // Guard clause if socket not initialized
  }

  // Pass the callback function 'cb' directly to the listener
  socketInstance.on(eventName, cb);

  // No return cleanup function in minimal version
};
// --- END OF MINIMAL FIX ---

export const sendMessage = (eventName, data) => {
  if (!socketInstance) {
    console.error("Cannot send message: Socket not initialized.");
    return; // Guard clause
  }

  socketInstance.emit(eventName, data);
};

// No extra join/leave/disconnect functions in minimal version
