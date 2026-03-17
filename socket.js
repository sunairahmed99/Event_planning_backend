import { Server } from "socket.io";

const initSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*", // Adjust for production
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        // console.log(`[SOCKET] CONNECTED: ${socket.id}`);

        socket.on("join_room", (roomId) => {
            socket.join(roomId);
            // console.log(`[SOCKET] ROOM_JOIN: Socket ${socket.id} joined => ${roomId}`);
        });

        socket.on("send_message", (data) => {
            const { roomId, message, senderName, isAdmin } = data;
            // console.log(`[SOCKET] MESSAGE: [${isAdmin ? 'ADMIN' : 'USER'}] ${senderName} in ${roomId} => "${message.substring(0, 20)}..."`);

            // 1. Send to others in the same room (excludes sender)
            socket.to(roomId).emit("receive_message", data);
            // console.log(`[SOCKET] EMIT: receive_message to room ${roomId} (excluding sender)`);

            // If from user, broadcast to admins globally
            // 2. If it's a user message, notify all admins who are NOT in the room
            // Note: Since we can't easily exclude specific room members from io.to("admins"),
            // we rely on the frontend duplicate checks. However, we'll use socket.to("admins")
            // to at least exclude the sender if they happen to be in the admins room.
            if (!isAdmin) {
                socket.to("admins").emit("receive_message", data);
                // console.log(`[SOCKET] BROADCAST: User message to 'admins' room (excluding sender)`);
            }
        });

        socket.on("disconnect", (reason) => {
            // console.log(`[SOCKET] DISCONNECTED: ${socket.id} (Reason: ${reason})`);
        });

        socket.on("error", (error) => {
            console.error(`[SOCKET] ERROR on ${socket.id}:`, error);
        });
    });

    return io;
};

export default initSocket;
