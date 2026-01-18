import pool from "../config.js";
import { CommonModel } from "../models/CommonModel.js";

export const ProductService = {

  list: async () => {
    const query = `
      SELECT 
        p.id,
        p.product_name,
        s.name AS supplier_name,
        cat.category_name,
        p.cost_price,
        p.selling_price,
        p.sku,
        p.tax_rate,
        p.status,
        p.is_returnable,
        p.created_at,
        p.image,
        IFNULL(
          SUM(CASE WHEN st.type = 'credit' THEN st.stock ELSE 0 END) -
          SUM(CASE WHEN st.type = 'debit' THEN st.stock ELSE 0 END),
        0) AS stock
      FROM products p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN categories cat ON p.category_id = cat.id
      LEFT JOIN stocks st ON st.product_id = p.id
      ORDER BY p.id DESC`;
    return await CommonModel.rawQuery(query);
  },
  
  add: async (productData) => {
    const result = await CommonModel.insertData({
      table: "products",
      data: productData,
    });
    return result;
  },

  getById: async (id) => {
    const result = await CommonModel.getSingle({
      table: "products",
      conditions: { id },
    });
    return result;
  },

  update: async (productData) => {
    if (!productData || typeof productData !== "object") {
      throw new Error("Invalid product data");
    }
  
    const { id, ...updateFields } = productData;
  
    if (!id) throw new Error("ID is missing");
  
    return await CommonModel.updateData({
      table: "products",
      data: updateFields,
      conditions: { id }
    });
   
  },

  deleteData: async (id) => {
    const result = await CommonModel.deleteData({
      table: "products",
      conditions: { id },
    });
    return result;
  },

  searchProduct: async (search) => {
    const query = `
      SELECT 
        p.id,
        p.product_name,
        p.selling_price,
        p.image,
        p.barcode,
        o.min_qty,
        o.offer_price,
        o.offer_qty_price
      FROM products p
      LEFT JOIN offers o 
        ON o.product_id = p.id
        AND o.status = 'active'
        AND CURDATE() BETWEEN o.start_date AND o.end_date
      WHERE p.barcode = ?
      LIMIT 1
    `;
    return await CommonModel.rawQuery(query, [search]);
  },

  categoryWiseSubcategoryData:async(categoryId)=>{
    const result=await CommonModel.getAllData({table:"subcategories", fields: ["*"],conditions:{categoryId :`${categoryId}`}})
    return result
  },

  favouriteList: async () => {
    const query = `
    SELECT 
    p.id,
        p.product_name,
        cat.category_name,
        p.selling_price,
        p.image,
    o.min_qty,
    o.offer_price,
    o.offer_qty_price
  FROM products p
  LEFT JOIN categories cat ON p.category_id = cat.id
  LEFT JOIN offers o ON o.product_id = p.id
    AND o.status = 'active'
    AND CURDATE() BETWEEN o.start_date AND o.end_date 
    WHERE p.favourite='yes'
    ORDER BY p.id DESC`
    return await CommonModel.rawQuery(query);
  },

  looseItemList: async () => {
    const query = `
    SELECT 
    p.id,
        p.product_name,
        cat.category_name,
        p.selling_price,
        p.image,
    o.min_qty,
    o.offer_price
  FROM products p
  LEFT JOIN categories cat ON p.category_id = cat.id
  LEFT JOIN offers o ON o.product_id = p.id
    AND o.status = 'active'
    AND CURDATE() BETWEEN o.start_date AND o.end_date 
    WHERE p.favourite='loose'
    ORDER BY p.id DESC`
    return await CommonModel.rawQuery(query);
  },

  inventoryList: async () => {
    const query = `
      SELECT 
        p.id,
        p.product_name,
        s.name AS supplier_name,
        cat.category_name,
        p.cost_price,
        p.selling_price,
        p.sku,
        p.tax_rate,
        p.status,
        p.is_returnable,
        p.created_at,
        p.image,
        IFNULL(
          SUM(CASE WHEN st.type = 'credit' THEN st.stock ELSE 0 END) -
          SUM(CASE WHEN st.type = 'debit' THEN st.stock ELSE 0 END),
        0) AS stock
      FROM products p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN categories cat ON p.category_id = cat.id
      LEFT JOIN stocks st ON st.product_id = p.id
      GROUP BY p.id
      ORDER BY p.id DESC
    `;
    return await CommonModel.rawQuery(query);
  },



};
