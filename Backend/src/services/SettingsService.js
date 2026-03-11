import pool from "../config.js";
import { CommonModel } from "../models/CommonModel.js";

export const SettingsService = {

  // Get all settings for a store
  list: async (storeId) => {
    const result = await CommonModel.getAllData({
      table: "settings",
      conditions: { store_id: storeId },
      orderBy: "setting_key ASC"
    });
    return result;
  },

  // Get all settings as key-value object
  getAll: async (storeId) => {
    const settings = await CommonModel.getAllData({
      table: "settings",
      conditions: { store_id: storeId }
    });

    // Convert array to key-value object
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.setting_key] = setting.setting_value;
    });

    return settingsObj;
  },

  // Get a single setting by key
  getByKey: async (key, storeId) => {
    const result = await CommonModel.getSingle({
      table: "settings",
      conditions: { setting_key: key, store_id: storeId }
    });
    return result;
  },

  // Update or insert a single setting
  upsert: async (key, value, storeId) => {
    const query = `
      INSERT INTO settings (store_id, setting_key, setting_value)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
    `;
    return await CommonModel.rawQuery(query, [storeId, key, value]);
  },

  // Bulk update multiple settings
  bulkUpdate: async (settingsData, storeId) => {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      for (const [key, value] of Object.entries(settingsData)) {
        const query = `
          INSERT INTO settings (store_id, setting_key, setting_value)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
        `;
        await connection.query(query, [storeId, key, value]);
      }

      await connection.commit();
      return { success: true };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Delete a setting
  deleteByKey: async (key, storeId) => {
    const result = await CommonModel.deleteData({
      table: "settings",
      conditions: { setting_key: key, store_id: storeId }
    });
    return result;
  },

  // Get settings by category (using key prefix)
  getByCategory: async (category, storeId) => {
    const query = `
      SELECT * FROM settings
      WHERE store_id = ? AND setting_key LIKE ?
      ORDER BY setting_key ASC
    `;
    return await CommonModel.rawQuery(query, [storeId, `${category}%`]);
  }

};
