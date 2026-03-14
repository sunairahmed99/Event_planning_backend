import app from "./app.js";
import dotenv from 'dotenv';
import http from "http";

import initSocket from "./socket.js";

dotenv.config({ quiet: true })





const port = process.env.PORT || 9000;
const server = http.createServer(app);

// Initialize Sockets
initSocket(server);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});



