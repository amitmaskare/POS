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
        p.unit_price,
        p.reorder_level,
        p.initial_stock,
        p.sku,
        p.unit_per_package,
        p.unit,
        p.tax_rate,
        p.status,
        p.image
      FROM products p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN categories cat ON p.category_id = cat.id
      ORDER BY p.id DESC`;
    return await CommonModel.rawQuery(query);
  },

  // list: async () => {
  //   const result = await CommonModel.getAllData({
  //     table: "products",
  //     fields: ["id,product_name,sku,category_id,unit_price,unit_per_package,min_stock,max_stock,status,unit"],
  //   });
  //   return result;
  // },

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

  // searchProduct:async(search)=>{
  //   const result=await CommonModel.getSingle({table:"products", fields: ["id,product_name,category_id,selling_price,image"],conditions:{barcode :`${search}`},orderBy: "product_name ASC"})
  //   return result
  // },

  searchProduct: async (search) => {
    const query = `
      SELECT 
        p.id,
        p.product_name,
        p.selling_price,
        p.image,
        p.barcode,
        o.min_qty,
        o.offer_price
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
    o.offer_price
  FROM products p
  LEFT JOIN categories cat ON p.category_id = cat.id
  LEFT JOIN offers o ON o.product_id = p.id
    AND o.status = 'active'
    AND CURDATE() BETWEEN o.start_date AND o.end_date 
    WHERE p.favourite='yes'
    ORDER BY p.id DESC`
    return await CommonModel.rawQuery(query);
  },

//   SELECT 
//   p.id,
//   p.product_name,
//   cat.category_name,
//   p.selling_price,
//   p.image
// FROM products p
// LEFT JOIN categories cat ON p.category_id = cat.id
// WHERE p.favourite='yes'
// ORDER BY p.id DESC`;

};
