import pool from "../config.js";

export const CommonModel = {
  getAllData: async ({
    table,
    fields = ["*"],
    conditions = {},
    groupBy = "",
    orderBy = "",
    limit = "",
  } = {}) => {
    let sql = `SELECT ${fields.join(", ")} FROM ${table}`;
    const values = [];

    // Add WHERE conditions dynamically
    const conditionKeys = Object.keys(conditions);
    if (conditionKeys.length) {
      const whereClauses = conditionKeys.map((key) => {
        values.push(conditions[key]);
        return `${key} = ?`;
      });
      sql += " WHERE " + whereClauses.join(" AND ");
    }
    if (groupBy) {
      sql += " GROUP BY " + groupBy;
    }
    // Add ORDER BY if provided
    if (orderBy) {
      sql += " ORDER BY " + orderBy;
    }
    if (limit) {
      sql += " LIMIT " + limit;
    }
    const [rows] = await pool.query(sql, values);
    return rows;
  },

  getSingle: async ({
    table,
    fields = ["*"],
    conditions = {},
    groupBy = "",
    orderBy = "",
    limit = "",
  } = {}) => {
    const rows = await CommonModel.getAllData({
      table,
      fields,
      conditions,
      groupBy: "",
      orderBy: "",
      limit: "",
    });
    return rows[0];
  },
  insertData: async ({ table, data } = {}) => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => "?").join(", ");

    const sql = `INSERT INTO ${table} (${keys.join(
      ", "
    )}) VALUES (${placeholders})`;
    const [result] = await pool.promise().query(sql, values);
    return result.insertId;
  },

  updateData: async ({ table, data, conditions } = {}) => {
    const setKeys = Object.keys(data);
    const setValues = Object.values(data);
    const setClause = setKeys.map((key) => `${key} = ?`).join(", ");

    const conditionKeys = Object.keys(conditions);
    const conditionValues = Object.values(conditions);
    const whereClause = conditionKeys.map((key) => `${key} = ?`).join(" AND ");

    const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
    const [result] = await pool
      .promise()
      .query(sql, [...setValues, ...conditionValues]);
    return result.affectedRows;
  },

  deleteData: async ({ table, conditions } = {}) => {
    const conditionKeys = Object.keys(conditions);
    const conditionValues = Object.values(conditions);
    const whereClause = conditionKeys.map((key) => `${key} = ?`).join(" AND ");

    const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
    const [result] = await pool.promise().query(sql, conditionValues);
    return result.affectedRows;
  },
};
