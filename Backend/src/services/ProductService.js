import pool from "../config.js";
import { CommonModel } from "../models/CommonModel.js";

export const ProductService = {
  list: async () => {
    const result = await CommonModel.getAllData({
      table: "products",
      fields: ["id,product_name,sku,category_id,unit_price,unit_per_package,min_stock,max_stock,status,unit"],
    });
    return result;
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

  update: async (id,productData) => {
    const result = await CommonModel.updateData({
      table: "products",
      data: productData,
      consitions: { id: id },
    });
    return result;
  },

  deleteData: async (id) => {
    const result = await CommonModel.deleteData({
      table: "products",
      conditions: { id },
    });
    return result;
  },
};
