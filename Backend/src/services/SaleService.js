import { table } from "console"
import {CommonModel} from "../models/CommonModel.js"
import pool from "../config.js"

export const SaleService={

    list:async(storeId)=>{
      const query = `
      SELECT
      sale.id,
      sale.invoice_no,
      sale.cash_amount,
      sale.online_amount,
      sale.online_method,
      DATE_FORMAT(sale.created_at, '%Y-%m-%d') AS sale_date,
      DATE_FORMAT(sale.created_at, '%h:%i %p') AS sale_time,
      COUNT(
        DISTINCT CASE
          WHEN si.is_returned = 'no' THEN si.id
          ELSE NULL
        END
      ) AS total_items,
      sale.total AS amount,
      UPPER(sale.status) AS status,
      UPPER(sale.payment_method) AS paymentMethod,
      CASE
        WHEN sale.payment_method = 'split' THEN
          CONCAT('Split (Cash: ₹', IFNULL(sale.cash_amount, 0), ' + ',
                 UPPER(IFNULL(sale.online_method, 'Online')), ': ₹', IFNULL(sale.online_amount, 0), ')')
        WHEN sale.payment_method = 'qr_code' THEN 'QR Code/UPI'
        WHEN sale.payment_method = 'pos_card' THEN 'POS Card'
        WHEN sale.payment_method = 'credit' THEN 'Credit Card'
        WHEN sale.payment_method = 'cash' THEN 'Cash'
        ELSE UPPER(sale.payment_method)
      END AS paymentMethodDisplay
    FROM sales AS sale
    LEFT JOIN sales_items AS si
      ON si.sale_id = sale.id
    WHERE sale.store_id = ?
    GROUP BY
      sale.id
    ORDER BY sale.id DESC
    `;
    return await CommonModel.rawQuery(query, [storeId]);
    },

    generateInvoice: async () => {
  const [rows] = await pool.promise().query(
    `SELECT invoice_no FROM sales WHERE invoice_no LIKE 'TXN%' ORDER BY invoice_no DESC 
    LIMIT 1`
  );

  let nextSeq = 1;

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const todayPrefix = `TXN${year}${month}${day}`;

  if (rows.length > 0) {
    const lastInvoice = rows[0].invoice_no;

    // Extract last 4 digits safely
    const lastSeq = parseInt(lastInvoice.slice(-4), 10);

    if (!isNaN(lastSeq)) {
      nextSeq = lastSeq + 1;
    }
  }

  const formattedSeq = String(nextSeq).padStart(4, "0");

  return `${todayPrefix}${formattedSeq}`;
},

    createSale: async (data, storeId) => {
        return await CommonModel.insertData({
          table: "sales",
          data,
          storeId
        });
      },

    createSaleItem: async (data) => {
        return await CommonModel.insertData({
          table: "sales_items",
          data:data,
        });
      },

      getSaleById :async(id, storeId)=>{
        const result=await CommonModel.getSingle({table:"sales", conditions: { id }, storeId})
        return result
      },

      getSale :async(invoice_no, storeId)=>{
        const result=await CommonModel.getSingle({table:"sales", conditions: { invoice_no:invoice_no }, storeId})
        return result
      },


      saleReport: async (storeId) => {
        const query = `
        SELECT 
        s.invoice_no,
        s.total,
        s.payment_type,
        COUNT(si.id) AS items
      FROM sales s
      LEFT JOIN sales_items si ON si.sale_id = s.id
      WHERE s.store_id = ?
      GROUP BY s.id`
        return await CommonModel.rawQuery(query, [storeId]);
      },

      transactionList:async(storeId)=>{
        const query = `
        SELECT 
          s.id,
          s.invoice_no,
          s.total,
          s.payment_method,
          s.payment_status,
          s.created_at,
          p.razorpay_payment_id
        FROM sales s
        LEFT JOIN payments p ON p.sale_id = s.id
        WHERE s.store_id = ?
        ORDER BY s.created_at DESC
      `;
      return await CommonModel.rawQuery(query, [storeId]);    
      },   

}