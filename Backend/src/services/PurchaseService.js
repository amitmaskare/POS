import pool from "../config.js";
import { CommonModel } from "../models/CommonModel.js";

export const PurchaseService = {
  list: async () => {
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
      GROUP BY
        p.id, p.po_number, p.purchase_date, s.name, p.grand_total, p.status
      ORDER BY p.id DESC
    `;
  
    return await CommonModel.rawQuery(query);
  },

  getNextPurchaseId: async (type) => {

    const isDraft = type === "draft";
    const prefix = isDraft ? "TEMP" : "PO";
  
    // Read last po_number from database (TEMP + PO both)
    const [rows] = await pool.promise().query(
      "SELECT po_number FROM purchases ORDER BY id DESC LIMIT 1"
    );
  
    let nextSeq = 1;
  
    if (rows.length > 0) {
      const lastPo = rows[0].po_number; // TEMP-0006 OR PO-0006
      const parts = lastPo.split("-");
  
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      nextSeq = lastSeq + 1;
    }
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const formattedSeq = String(nextSeq).padStart(4, "0");
  
    return `${prefix}-${day}-${month}-${year}-${formattedSeq}`;
  },
  
  getFinalPoFromDraft: (oldPo) => {
    // oldPo = TEMP-06-12-2025-0003
    const parts = oldPo.split("-");
  
    const seq = parts[4]; // 0003
  
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
  
    return `PO-${day}-${month}-${year}-${seq}`;
  },
  
  
  add: async (productData) => {
    const result = await CommonModel.insertData({
      table: "purchases",
      data: productData,
    });
    return result;
  },

  addItem: async (data) => {
    return await CommonModel.insertData({
      table: "purchase_order_items",
      data:data,
    });
  },

  getById: async (id) => {
    const result = await CommonModel.getSingle({
      table: "purchases",
      conditions: { id },
    });
    return result;
  },

  update: async (data) => {
    const{id,purchase_date,supplier_id,subtotal,tax,grand_total,type,po_number}=data;
    const result = await CommonModel.updateData({
      table: "purchases",
      data: data,
      conditions: {id},
    });
    return result;
  },

 
  changeStatus:async(data)=>{
    const {id,type}=data
    const result = await CommonModel.updateData({
      table: "purchases",
      data: data,
      conditions: {id},
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

  receiveItems: async () => {
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
      WHERE p.type = 'send'
      GROUP BY
        p.id, p.po_number, p.purchase_date, s.name, p.grand_total
      ORDER BY p.id DESC
    `;
  
    return await CommonModel.rawQuery(query);
  },
  

};
