import pool from "../config.js";
import { CommonModel } from "../models/CommonModel.js";

export const ProductService = {

  list: async (storeId) => {
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
  WHERE p.store_id = ?
  GROUP BY p.id
  HAVING stock > 0
  ORDER BY p.id DESC;
  `;
    return await CommonModel.rawQuery(query, [storeId]);
  },
  
  add: async (productData, storeId) => {
    const result = await CommonModel.insertData({
      table: "products",
      data: productData,
      storeId,
    });
    return result;
  },

  getById: async (id, storeId) => {
    const result = await CommonModel.getSingle({
      table: "products",
      conditions: { id },
      storeId,
    });
    return result;
  },

  update: async (productData, storeId) => {
    if (!productData || typeof productData !== "object") {
      throw new Error("Invalid product data");
    }
  
    const { id, ...updateFields } = productData;
  
    if (!id) throw new Error("ID is missing");
  
    return await CommonModel.updateData({
      table: "products",
      data: updateFields,
      conditions: { id },
      storeId,
    });
   
  },

  deleteData: async (id, storeId) => {
    const result = await CommonModel.deleteData({
      table: "products",
      conditions: { id },
      storeId,
    });
    return result;
  },

  searchProduct: async (search, storeId) => {
    const query = `
      SELECT
        p.id,
        p.product_name,
        p.selling_price,
        p.image,
        p.barcode,
        p.tax_rate,
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

  favouriteList: async (storeId) => {
    console.log('ProductService.favouriteList called with storeId:', storeId, 'type:', typeof storeId);

    // If no storeId (super admin), show all products
    const query = storeId ? `
    SELECT
    p.id,
        p.product_name,
        cat.category_name,
        p.selling_price,
        p.image,
        p.tax_rate,
    o.min_qty,
    o.offer_price,
    o.offer_qty_price
  FROM products p
  LEFT JOIN categories cat ON p.category_id = cat.id
  LEFT JOIN offers o ON o.product_id = p.id
    AND o.status = 'active'
    AND CURDATE() BETWEEN o.start_date AND o.end_date
    WHERE p.favourite='yes' AND p.store_id = ?
    ORDER BY p.id DESC` : `
    SELECT
    p.id,
        p.product_name,
        cat.category_name,
        p.selling_price,
        p.image,
        p.tax_rate,
    o.min_qty,
    o.offer_price,
    o.offer_qty_price
  FROM products p
  LEFT JOIN categories cat ON p.category_id = cat.id
  LEFT JOIN offers o ON o.product_id = p.id
    AND o.status = 'active'
    AND CURDATE() BETWEEN o.start_date AND o.end_date
    WHERE p.favourite='yes'
    ORDER BY p.id DESC`;

    const result = storeId
      ? await CommonModel.rawQuery(query, [storeId])
      : await CommonModel.rawQuery(query, []);
    console.log('ProductService.favouriteList result count:', result?.length || 0);
    return result;
  },

  looseItemList: async (storeId) => {
    console.log('ProductService.looseItemList called with storeId:', storeId, 'type:', typeof storeId);

    // If no storeId (super admin), show all products
    const query = storeId ? `
    SELECT
    p.id,
        p.product_name,
        cat.category_name,
        p.selling_price,
        p.image,
        p.tax_rate,
    o.min_qty,
    o.offer_price
  FROM products p
  LEFT JOIN categories cat ON p.category_id = cat.id
  LEFT JOIN offers o ON o.product_id = p.id
    AND o.status = 'active'
    AND CURDATE() BETWEEN o.start_date AND o.end_date
    WHERE p.favourite='loose' AND p.store_id = ?
    ORDER BY p.id DESC` : `
    SELECT
    p.id,
        p.product_name,
        cat.category_name,
        p.selling_price,
        p.image,
        p.tax_rate,
    o.min_qty,
    o.offer_price
  FROM products p
  LEFT JOIN categories cat ON p.category_id = cat.id
  LEFT JOIN offers o ON o.product_id = p.id
    AND o.status = 'active'
    AND CURDATE() BETWEEN o.start_date AND o.end_date
    WHERE p.favourite='loose'
    ORDER BY p.id DESC`;

    const result = storeId
      ? await CommonModel.rawQuery(query, [storeId])
      : await CommonModel.rawQuery(query, []);
    console.log('ProductService.looseItemList result count:', result?.length || 0);
    return result;
  },

  inventoryList: async (storeId) => {
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
      WHERE p.store_id = ?
      GROUP BY p.id
      ORDER BY p.id DESC
    `;
    return await CommonModel.rawQuery(query, [storeId]);
  },

  lowStockReport: async (storeId) => {
    const query = `
      SELECT 
        p.id,
        p.product_name,
        p.sku,
        p.reorder_level,
        p.min_stock,
        p.selling_price,
        IFNULL(
          SUM(CASE WHEN st.type = 'credit' THEN st.stock ELSE 0 END) -
          SUM(CASE WHEN st.type = 'debit' THEN st.stock ELSE 0 END),
        0) AS stock
      FROM products p
      LEFT JOIN stocks st ON st.product_id = p.id
      WHERE p.store_id = ?
      GROUP BY p.id
      HAVING stock <= COALESCE(p.reorder_level, p.min_stock, 0)
      ORDER BY stock ASC
    `;

    return await CommonModel.rawQuery(query, [storeId]);
  },



};
