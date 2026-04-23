import { CommonModel } from "../models/CommonModel.js";

export const CuponService = {

   list: async (storeId) => {
  const query = `
    SELECT 
      co.id,
      co.storeId,
      co.cupon_code,
      co.discount,
      DATE_FORMAT(co.start_date, '%Y-%m-%d') AS start_date,
      DATE_FORMAT(co.end_date, '%Y-%m-%d') AS end_date,
      co.description
    FROM cupon_code co
    WHERE co.storeId = ?
    ORDER BY co.id DESC
  `;
  
  return await CommonModel.rawQuery(query, [storeId]);
},

    add: async (data, storeId) => {
        const payload = {
            storeId:      storeId,
            cupon_code:   data.cupon_code,
            discount:     data.discount,
            start_date:   data.start_date,
            end_date:     data.end_date,
            description:  data.description || null
            // created_at & updated_at → handled automatically by DB (current_timestamp)
        };

        const result = await CommonModel.insertData({
            table: "cupon_code",
            data: payload
        });
        return result;
    },

    getById: async (id, storeId) => {
        const result = await CommonModel.getSingle({
            table: " cupon_code",
            conditions: { id, storeId }
        });
        return result;
    },

    update: async (data, storeId) => {
        const payload = {
            cupon_code:  data.cupon_code,
            discount:    data.discount,
            start_date:  data.start_date,
            end_date:    data.end_date,
            description: data.description || null
            // updated_at → handled automatically by DB (ON UPDATE CURRENT_TIMESTAMP)
        };

        const result = await CommonModel.updateData({
            table: "cupon_code",
            data: payload,
            conditions: { id: data.id, storeId }
        });
        return result;
    },

    deleteData: async (id, storeId) => {
        const result = await CommonModel.deleteData({
            table: " cupon_code",
            conditions: { id, storeId }
        });
        return result;
    }
};