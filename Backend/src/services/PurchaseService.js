import pool from "../config.js";
import { CommonModel } from "../models/CommonModel.js";

export const PurchaseService = {
  list: async () => {
    const result = await CommonModel.getAllData({
      table: "purchase_orders",
      fields: ["id,po_number,userId,date,supplier_id,received,total,status"],
    });
    return result;
  },

getNextPurchaseId: async () => {
  const [rows] = await pool
    .promise()
    .query("SELECT po_number FROM purchase_orders ORDER BY id DESC LIMIT 1");

  // Get current month and year
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();

  let nextSeq = 1;

  if (rows.length > 0) {
    const lastPo = rows[0].po_number; // Example: "PO-04-2025-0005"
    const parts = lastPo.split("-");
    if (parts.length === 4) {
      const lastMonth = parts[1];
      const lastYear = parts[2];
      const lastSeq = parseInt(parts[3], 10);

      // If same month & year, increment sequence
      if (lastMonth === month && lastYear === year.toString()) {
        nextSeq = lastSeq + 1;
      }
    }
  }

  // Format sequence number as 4 digits (e.g., 0001)
  const formattedSeq = String(nextSeq).padStart(4, "0");

  // Final PO format
  const nextPo = `PO-${month}-${year}-${formattedSeq}`;

  return nextPo;
},

  add: async (productData) => {
    const result = await CommonModel.insertData({
      table: "purchase_orders",
      data: productData,
    });
    return result;
  },

  getById: async (id) => {
    const result = await CommonModel.getSingle({
      table: "purchase_orders",
      conditions: { id },
    });
    return result;
  },

  update: async (id,data) => {
    const result = await CommonModel.updateData({
      table: "purchase_orders",
      data: data,
      consitions: { id: id },
    });
    return result;
  },

  deleteData: async (id) => {
    const result = await CommonModel.deleteData({
      table: "purchase_orders",
      conditions: { id },
    });
    return result;
  },
};
