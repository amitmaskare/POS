import pool from "../config.js";
import { CommonModel } from "../models/CommonModel.js";

export const PurchaseService = {
  list: async (storeId) => {
    const query = `
      SELECT 
        p.id,
        p.po_number,
        DATE_FORMAT(p.purchase_date, '%Y-%m-%d') AS purchase_date,
        s.name AS supplier_name,
        COUNT(pi.id) AS total_items,
        p.grand_total AS amount,
        UPPER(p.type) as type,
        p.status
      FROM purchases p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN purchase_order_items pi ON pi.po_number = p.po_number
      WHERE p.store_id = ?
      GROUP BY
        p.id, p.po_number, p.purchase_date, s.name, p.grand_total, p.status
      ORDER BY p.id DESC
    `;
  
    return await CommonModel.rawQuery(query, [storeId]);
  },

  getNextPurchaseId: async (type, storeId) => {
    // Get current date
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const datePrefix = `${year}${month}${day}`;

    // Query to get the last PO number with same date prefix for this store
    const [rows] = await pool.promise().query(
      `SELECT po_number FROM purchases 
       WHERE po_number LIKE ? AND store_id = ?
       ORDER BY id DESC LIMIT 1`,
      [`${datePrefix}%`, storeId]
    );

    let nextSeq = 1;

    if (rows.length > 0) {
      const lastPo = rows[0].po_number; // e.g., PO202602050001
      // Extract sequence number (last 4 digits)
      const lastSeq = parseInt(lastPo.slice(-4), 10);
      nextSeq = lastSeq + 1;
    }

    const formattedSeq = String(nextSeq).padStart(4, "0");
    return `PO${datePrefix}${formattedSeq}`;
  },
  
  getFinalPoFromDraft: (oldPo) => {
    // oldPo could be any format; extract sequence from last 4 digits
    const seq = oldPo.slice(-4); // extract last 4 digits
  
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const datePrefix = `${year}${month}${day}`;
  
    return `PO${datePrefix}${seq}`;
  },
  
  
  add: async (productData, storeId) => {
    const result = await CommonModel.insertData({
      table: "purchases",
      data: productData,
      storeId
    });
    return result;
  },

  addItem: async (data) => {
    return await CommonModel.insertData({
      table: "purchase_order_items",
      data
    });
  },

  getById: async (id, storeId) => {
    const result = await CommonModel.getSingle({
      table: "purchases",
      conditions: { id },
      storeId
    });
    return result;
  },

  update: async (data, storeId) => {
    const{id,purchase_date,supplier_id,subtotal,tax,grand_total,type,po_number}=data;
    const result = await CommonModel.updateData({
      table: "purchases",
      data: data,
      conditions: {id},
      storeId
    });
    return result;
  },

 
  changeStatus:async(data, storeId)=>{
    const {id,type}=data
    const result = await CommonModel.updateData({
      table: "purchases",
      data: data,
      conditions: {id},
      storeId
    });
    return result;
  },

  updatePoNumber: async (oldPo, newPo) => {
    await pool.promise().query(
      "UPDATE purchases SET po_number = ? WHERE po_number = ?",
      [newPo, oldPo]
    );
  
    await pool.promise().query(
      "UPDATE purchase_order_items SET po_number = ? WHERE po_number = ?",
      [newPo, oldPo]
    );
  
    return true;
  },

  receiveItems: async (storeId) => {
    const query = `
      SELECT 
        p.id,
        p.po_number,
        DATE_FORMAT(p.purchase_date, '%Y-%m-%d') AS purchase_date,
        s.name AS supplier_name,
        COUNT(pi.id) AS total_items,
        p.grand_total AS amount
      FROM purchases p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN purchase_order_items pi ON pi.po_number = p.po_number
      WHERE p.type = 'send' AND p.store_id = ?
      GROUP BY
        p.id, p.po_number, p.purchase_date, s.name, p.grand_total
      ORDER BY p.id DESC
    `;
  
    return await CommonModel.rawQuery(query, [storeId]);
  },
  

};
