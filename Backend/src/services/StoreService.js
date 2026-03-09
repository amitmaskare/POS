import pool from "../config.js";
import { CommonModel } from "../models/CommonModel.js";

export const StoreService = {
  list: async () => {
    const result = await CommonModel.getAllData({
      table: "stores",
      fields: ["id,store_id,store_name,phone,email,address,type,location,logo,created_at"],
      conditions:'',
      groupBy: "",
      orderBy: "id DESC",
    });
    return result;
  },

  getNextStoreId: async () => {
    const [rows] = await pool
      .promise()
      .query("SELECT store_id FROM stores ORDER BY id DESC LIMIT 1");

    let nextId = 1000;
    if (rows.length > 0) {
      const lastId = rows[0].store_id.replace("STORE", "");
      nextId = parseInt(lastId) + 1;
    }

    return `STORE${nextId}`;
  },

  add: async (storeData) => {
    const result = await CommonModel.insertData({
      table: "stores",
      data: storeData,
    });
    return result;
  },

  getById: async (id) => {
    const result = await CommonModel.getSingle({
      table: "stores",
      fields: [
        "id,store_id,store_name,phone,address,logo,email,type,location,created_at",
      ],
      conditions: { id },
    });
    return result;
  },

  update: async (id,storeData) => {
    const result = await CommonModel.updateData({
      table: "stores",
      data: storeData,
      conditions: { id: id },
    });
    return result;
  },

  deleteData: async (id) => {
    const result = await CommonModel.deleteData({
      table: "stores",
      conditions: { id },
    });
    return result;
  },
};
