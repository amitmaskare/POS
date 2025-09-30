import pool from "../config.js";
import { CommonModel } from "../models/CommonModel.js";

export const StoreService = {
  list: async () => {
    const result = await CommonModel.getAllData({
      table: "stores",
    });
    return result;
  },

  add: async (storeData) => {
    const result = await CommonModel.insertData({
      table: "stores",
      data: { storeData },
    });
    return result;
  },
};
