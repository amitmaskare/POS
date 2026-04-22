import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import app from "./src/app.js";

import { setupPOSTables } from "./src/config/setupPOSTables.js";
import { setupSplitPaymentColumns } from "./src/config/setupSplitPayment.js";
import { setupReturnSplitPaymentColumns } from "./src/config/setupReturnSplitPayment.js";
import { setupPaymentColumns } from "./src/config/setupPaymentColumns.js";

dotenv.config();

const PORT = process.env.PORT || 4000;

// create HTTP server
const server = http.createServer(app);

// create socket server
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// socket connection
io.on("connection", (socket) => {

  console.log("Client Connected:", socket.id);

  // join room (POS terminal)
  socket.on("join-room", (roomId) => {

    socket.join(roomId);

    console.log(`Socket ${socket.id} joined room ${roomId}`);

  });

  // bill update from POS
  socket.on("update-bill", ({ roomId, bill }) => {

    console.log("Bill update for room:", roomId);

    // send bill only to that POS + customer screen
    io.to(roomId).emit("display-bill", bill);

  });

  // payment completed - show thank you
  socket.on("show-thankyou", ({ roomId }) => {

    console.log("Payment completed for room:", roomId);

    // send thank you to customer display
    io.to(roomId).emit("show-thankyou");

  });

  socket.on("disconnect", () => {

    console.log("Client disconnected:", socket.id);

  });

});


// setup database tables first
Promise.all([
  setupPOSTables(),
  setupSplitPaymentColumns(),
  setupReturnSplitPaymentColumns(),
  setupPaymentColumns()
])
.then(() => {

  server.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);

  });

})
.catch((error) => {

  console.error("Database setup failed:", error);

});