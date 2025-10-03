import dotenv from "dotenv";
import app from "./src/app.js";
dotenv.config();
const PORT = process.env.PORT;
if (app.listen) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
console.log("server is not running");
