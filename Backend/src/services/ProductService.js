import pool from "../config.js";
import { CommonModel } from "../models/CommonModel.js";

export const ProductService = {

  list: async (storeId) => {
    const query = storeId ? `
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
  ORDER BY p.id DESC
  ` : `
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
  HAVING stock > 0
  ORDER BY p.id DESC
  `;
    return storeId
      ? await CommonModel.rawQuery(query, [storeId])
      : await CommonModel.rawQuery(query, []);
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
        p.favourite,
        p.is_loose,
        p.price_per_unit,
        p.loose_unit,
        p.loose_product_code,
        p.unit,
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

  searchProductList: async (search, storeId) => {
    const searchTerm = `%${search}%`;
    const query = `
      SELECT
        p.id,
        p.product_name,
        p.selling_price,
        p.image,
        p.barcode,
        p.tax_rate,
        p.sku,
        p.brand,
        p.favourite,
        p.is_loose,
        p.price_per_unit,
        p.loose_unit,
        p.loose_product_code,
        p.unit,
        cat.category_name,
        o.min_qty,
        o.offer_price,
        o.offer_qty_price,
        IFNULL(
          SUM(CASE WHEN st.type = 'credit' THEN st.stock ELSE 0 END) -
          SUM(CASE WHEN st.type = 'debit' THEN st.stock ELSE 0 END),
        0) AS stock
      FROM products p
      LEFT JOIN offers o
        ON o.product_id = p.id
        AND o.status = 'active'
        AND CURDATE() BETWEEN o.start_date AND o.end_date
      LEFT JOIN categories cat ON p.category_id = cat.id
      LEFT JOIN stocks st ON st.product_id = p.id
      WHERE (p.barcode LIKE ? OR p.product_name LIKE ? OR p.sku LIKE ?)
        AND p.status = 'Active'
        AND p.store_id = ?
      GROUP BY p.id
      ORDER BY
        CASE
          WHEN p.barcode = ? THEN 1
          WHEN p.barcode LIKE ? THEN 2
          WHEN p.product_name LIKE ? THEN 3
          ELSE 4
        END,
        p.product_name ASC
      LIMIT 50
    `;
    return await CommonModel.rawQuery(query, [
      searchTerm, searchTerm, searchTerm, storeId,
      search, `${search}%`, `${search}%`
    ]);
  },

  allProductsList: async (storeId) => {
    console.log('ProductService.allProductsList called with storeId:', storeId, 'type:', typeof storeId);

    // Get all active products for the store
    const query = storeId ? `
    SELECT
    p.id,
        p.product_name,
        cat.category_name,
        p.selling_price,
        p.image,
        p.tax_rate,
        p.barcode,
        p.sku,
        p.favourite,
        p.is_loose,
        p.price_per_unit,
        p.loose_unit,
        p.loose_product_code,
        p.unit,
    o.min_qty,
    o.offer_price,
    o.offer_qty_price
  FROM products p
  LEFT JOIN categories cat ON p.category_id = cat.id
  LEFT JOIN offers o ON o.product_id = p.id
    AND o.status = 'active'
    AND CURDATE() BETWEEN o.start_date AND o.end_date
    WHERE p.status = 'Active' AND p.store_id = ?
    ORDER BY p.id DESC` : `
    SELECT
    p.id,
        p.product_name,
        cat.category_name,
        p.selling_price,
        p.image,
        p.tax_rate,
        p.barcode,
        p.sku,
        p.favourite,
        p.is_loose,
        p.price_per_unit,
        p.loose_unit,
        p.loose_product_code,
        p.unit,
    o.min_qty,
    o.offer_price,
    o.offer_qty_price
  FROM products p
  LEFT JOIN categories cat ON p.category_id = cat.id
  LEFT JOIN offers o ON o.product_id = p.id
    AND o.status = 'active'
    AND CURDATE() BETWEEN o.start_date AND o.end_date
    WHERE p.status = 'Active'
    ORDER BY p.id DESC`;

    const result = storeId
      ? await CommonModel.rawQuery(query, [storeId])
      : await CommonModel.rawQuery(query, []);
    console.log('ProductService.allProductsList result count:', result?.length || 0);
    return result;
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
        p.barcode,
        p.sku,
        p.favourite,
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
        p.barcode,
        p.sku,
        p.favourite,
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
        p.barcode,
        p.sku,
        p.favourite,
        p.is_loose,
        p.price_per_unit,
        p.loose_unit,
        p.loose_product_code,
        p.unit,
    o.min_qty,
    o.offer_price
  FROM products p
  LEFT JOIN categories cat ON p.category_id = cat.id
  LEFT JOIN offers o ON o.product_id = p.id
    AND o.status = 'active'
    AND CURDATE() BETWEEN o.start_date AND o.end_date
    WHERE (p.favourite='loose' OR p.is_loose = 1) AND p.store_id = ?
    ORDER BY p.id DESC` : `
    SELECT
    p.id,
        p.product_name,
        cat.category_name,
        p.selling_price,
        p.image,
        p.tax_rate,
        p.barcode,
        p.sku,
        p.favourite,
        p.is_loose,
        p.price_per_unit,
        p.loose_unit,
        p.loose_product_code,
        p.unit,
    o.min_qty,
    o.offer_price
  FROM products p
  LEFT JOIN categories cat ON p.category_id = cat.id
  LEFT JOIN offers o ON o.product_id = p.id
    AND o.status = 'active'
    AND CURDATE() BETWEEN o.start_date AND o.end_date
    WHERE p.favourite='loose' OR p.is_loose = 1
    ORDER BY p.id DESC`;

    const result = storeId
      ? await CommonModel.rawQuery(query, [storeId])
      : await CommonModel.rawQuery(query, []);
    console.log('ProductService.looseItemList result count:', result?.length || 0);
    return result;
  },

  // Generate a weighted EAN-13 barcode for loose item
  // Format: "20" (2) + PPPPP (5) + WWWWW (5) = 12 data digits + 1 check digit = 13 total
  generateLooseBarcode: (productCode, weight) => {
    const weightInGrams = Math.round(weight * 1000);
    const data = "20" + String(productCode).padStart(5, "0") + String(weightInGrams).padStart(5, "0");

    // Calculate EAN-13 check digit
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(data[i], 10);
      sum += i % 2 === 0 ? digit : digit * 3;
    }
    const checkDigit = (10 - (sum % 10)) % 10;

    return data + checkDigit;
  },

  // Decode a weighted EAN-13 barcode back to product code + weight
  decodeLooseBarcode: (barcode) => {
    // Must be 13 digits and start with "20"
    if (!barcode || barcode.length !== 13 || !barcode.startsWith("20")) {
      return null;
    }

    const productCode = barcode.substring(2, 7); // 5-digit product code (positions 2-6)
    const weightCode = barcode.substring(7, 12);  // 5-digit weight in grams (positions 7-11)
    const weightInKg = parseInt(weightCode, 10) / 1000;

    return {
      productCode,
      weightInGrams: parseInt(weightCode, 10),
      weightInKg,
    };
  },

  // Find loose product by its 5-digit product code
  findByLooseProductCode: async (productCode, storeId) => {
    const query = storeId ? `
      SELECT
        p.id,
        p.product_name,
        p.selling_price,
        p.image,
        p.barcode,
        p.tax_rate,
        p.sku,
        p.is_loose,
        p.price_per_unit,
        p.loose_unit,
        p.loose_product_code,
        p.unit,
        o.min_qty,
        o.offer_price,
        o.offer_qty_price
      FROM products p
      LEFT JOIN offers o
        ON o.product_id = p.id
        AND o.status = 'active'
        AND CURDATE() BETWEEN o.start_date AND o.end_date
      WHERE p.loose_product_code = ? AND p.store_id = ? AND p.status = 'Active'
      LIMIT 1
    ` : `
      SELECT
        p.id,
        p.product_name,
        p.selling_price,
        p.image,
        p.barcode,
        p.tax_rate,
        p.sku,
        p.is_loose,
        p.price_per_unit,
        p.loose_unit,
        p.loose_product_code,
        p.unit,
        o.min_qty,
        o.offer_price,
        o.offer_qty_price
      FROM products p
      LEFT JOIN offers o
        ON o.product_id = p.id
        AND o.status = 'active'
        AND CURDATE() BETWEEN o.start_date AND o.end_date
      WHERE p.loose_product_code = ? AND p.status = 'Active'
      LIMIT 1
    `;

    const params = storeId ? [productCode, storeId] : [productCode];
    return await CommonModel.rawQuery(query, params);
  },

  // Get next available loose product code for a store
  getNextLooseProductCode: async (storeId) => {
    const query = storeId ? `
      SELECT MAX(CAST(loose_product_code AS UNSIGNED)) as max_code
      FROM products
      WHERE loose_product_code IS NOT NULL AND store_id = ?
    ` : `
      SELECT MAX(CAST(loose_product_code AS UNSIGNED)) as max_code
      FROM products
      WHERE loose_product_code IS NOT NULL
    `;

    const params = storeId ? [storeId] : [];
    const result = await CommonModel.rawQuery(query, params);
    const maxCode = result?.[0]?.max_code || 0;
    return String(maxCode + 1).padStart(5, "0");
  },

  inventoryList: async (storeId) => {
    const query = storeId ? `
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
    ` : `
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
    return storeId
      ? await CommonModel.rawQuery(query, [storeId])
      : await CommonModel.rawQuery(query, []);
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
