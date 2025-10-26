import socket from "socket.io-client";

let socketInstance = null;

export const initializeSocket = (projectId) => {
    socketInstance = socket(import.meta.env.VITE_API_URL, {
        auth: {
            token: localStorage.getItem("token")
        },
        query: {
            projectId
        }
    });

    return socketInstance;
}

export const recieveMessage = (eventNamer, cb) => {
    socketInstance.on(eventNamer, data);
}

export const sendMessage = (eventNamer, data) => {
    socketInstance.emit(eventNamer, data);
}
