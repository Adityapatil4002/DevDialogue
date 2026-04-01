import { io } from "socket.io-client"; // Standardized import

let socketInstance = null;

export const initializeSocket = (projectId) => {
  // Prevent re-initializing if socket already exists
  if (socketInstance) {
    return socketInstance;
  }

  console.log("Initializing socket for project:", projectId);

  // Initialize with the async auth callback
  socketInstance = io(import.meta.env.VITE_API_URL, {
    // 👇 Socket.io will automatically run this to grab the fresh Clerk token 👇
    auth: async (cb) => {
      try {
        let token = null;
        // Tap into the global Clerk object injected by your Provider
        if (window.Clerk && window.Clerk.session) {
          token = await window.Clerk.session.getToken();
        }
        // Pass the token into the socket handshake
        cb({ token });
      } catch (error) {
        console.error("Error fetching Clerk token for socket:", error);
        cb({ token: null });
      }
    },
    query: {
      projectId, // Pass projectId in query
    },
  });

  socketInstance.on("connect", () => {
    console.log("Socket connected securely:", socketInstance.id);
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

  // Return a cleanup function
  return () => {
    socketInstance.off(eventName, cb);
  };
};

export const sendMessage = (eventName, data) => {
  if (!socketInstance) {
    console.error("Cannot send message: Socket not initialized.");
    return; // Guard clause
  }

  socketInstance.emit(eventName, data);
};

export const disconnectSocket = () => {
  if (socketInstance) {
    console.log("Disconnecting socket...");
    socketInstance.disconnect();
    socketInstance = null;
  }
};
