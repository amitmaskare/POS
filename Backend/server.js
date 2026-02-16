import dotenv from "dotenv";
import app from "./src/app.js";
import { setupPOSTables } from "./src/config/setupPOSTables.js";

dotenv.config();
const PORT = process.env.PORT;

// Setup POS tables before starting server
setupPOSTables().then(() => {
  if (app.listen) {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  }
}).catch(error => {
  console.error("Failed to setup POS tables:", error);
});

console.log("server is not running");
