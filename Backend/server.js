import dotenv from "dotenv";
import app from "./src/app.js";
import { setupPOSTables } from "./src/config/setupPOSTables.js";
import { setupSplitPaymentColumns } from "./src/config/setupSplitPayment.js";
import { setupReturnSplitPaymentColumns } from "./src/config/setupReturnSplitPayment.js";
import { setupPaymentColumns } from "./src/config/setupPaymentColumns.js";

dotenv.config();
const PORT = process.env.PORT;

// Setup POS tables and split payment columns before starting server
Promise.all([
  setupPOSTables(),
  setupSplitPaymentColumns(),
  setupReturnSplitPaymentColumns(),
  setupPaymentColumns()
]).then(() => {
  if (app.listen) {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  }
}).catch(error => {
  console.error("Failed to setup database:", error);
});

console.log("server is not running");
