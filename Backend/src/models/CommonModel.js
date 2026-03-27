import pool from "../config.js";

export const CommonModel = {
  getAllData: async ({
    table,
    fields = ["*"],
    conditions = {},
    groupBy = "",
    orderBy = "",
    limit = "",
    storeId = null,
  } = {}) => {
    let sql = `SELECT ${fields.join(", ")} FROM ${table}`;
    const values = [];

    const whereClauses = [];

    // ✅ AUTO-ADD STORE_ID FILTER FOR MULTI-TENANT
    const tenantTables = ['categories', 'subcategories', 'products', 'customers', 'suppliers', 'packages', 'offers', 'purchases', 'sales', 'returns', 'hold_sales', 'ration_cards', 'payments', 'cards'];
    
    if (storeId && tenantTables.includes(table)) {
      whereClauses.push(`${table}.store_id = ?`);
      values.push(storeId);
    }

  for (let key in conditions) {
    const condition = conditions[key];

    // ✅ LIKE Condition
    if (typeof condition === "string" && condition.includes("%")) {
      whereClauses.push(`${key} LIKE ?`);
      values.push(condition);
    }

    // ✅ Date Range Condition
    else if (typeof condition === "object" && condition.from && condition.to) {
      whereClauses.push(`${key} BETWEEN ? AND ?`);
      values.push(condition.from, condition.to);
    }

     else if (key.endsWith("_not")) {
    const realKey = key.replace("_not", "");
    values.push(conditions[key])
    return `${realKey} != ?`;
  }

    // ✅ Exact Match
    else {
      whereClauses.push(`${key} = ?`);
      values.push(condition);
    }
    
  }

  if (whereClauses.length) {
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
    const [rows] = await pool.promise().query(sql, values);
    return rows;
  },

  getSingle: async ({
    table,
    fields = ["*"],
    conditions = {},
    groupBy = "",
    orderBy = "",
    limit = "",
    storeId = null,
  } = {}) => {
    const rows = await CommonModel.getAllData({
      table,
      fields,
      conditions,
      groupBy: "",
      orderBy: "",
      limit: "",
      storeId,
    });
    return rows[0];
  },
  insertData: async ({ table, data, storeId = null } = {}) => {
    // ✅ AUTO-ADD STORE_ID FOR TENANT TABLES
    const tenantTables = ['categories', 'subcategories', 'products', 'customers', 'suppliers', 'packages', 'offers', 'purchases', 'sales', 'returns', 'hold_sales', 'ration_cards', 'payments', 'cards'];

    if (storeId && tenantTables.includes(table) && !data.store_id) {
      data.store_id = storeId;
    }

    // ✅ REMOVE empty id field (causes "Incorrect integer value: ''" error)
    if (data.id === "" || data.id === null || data.id === undefined) {
      delete data.id;
    }

    // ✅ AUTO-ADD created_at and updated_at ONLY for tables that have these columns
    // Tables without timestamps: sales, sale_items, etc.
    const tablesWithTimestamps = ['customers', 'products', 'categories', 'subcategories', 'suppliers', 'users'];

    if (tablesWithTimestamps.includes(table)) {
      if (!data.created_at) {
        data.created_at = new Date();
      }
      if (!data.updated_at) {
        data.updated_at = new Date();
      }
    }

    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => "?").join(", ");

    const sql = `INSERT INTO ${table} (${keys.join(
      ", "
    )}) VALUES (${placeholders})`;
    const [result] = await pool.promise().query(sql, values);
    return result.insertId;
  },

  updateData: async ({ table, data, conditions, storeId = null } = {}) => {
    // ✅ AUTO-ADD STORE_ID FILTER FOR SECURITY
    const tenantTables = ['categories', 'subcategories', 'products', 'customers', 'suppliers', 'packages', 'offers', 'purchases', 'sales', 'returns', 'hold_sales', 'ration_cards', 'payments', 'cards'];
    
    if (storeId && tenantTables.includes(table) && !conditions.store_id) {
      conditions.store_id = storeId;
    }

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

  deleteData: async ({ table, conditions, storeId = null } = {}) => {
    // ✅ AUTO-ADD STORE_ID FILTER FOR SECURITY
    const tenantTables = ['categories', 'subcategories', 'products', 'customers', 'suppliers', 'packages', 'offers', 'purchases', 'sales', 'returns', 'hold_sales', 'ration_cards', 'payments', 'cards'];
    
    if (storeId && tenantTables.includes(table) && !conditions.store_id) {
      conditions.store_id = storeId;
    }

    const conditionKeys = Object.keys(conditions);
    const conditionValues = Object.values(conditions);
    const whereClause = conditionKeys.map((key) => `${key} = ?`).join(" AND ");

    const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
    const [result] = await pool.promise().query(sql, conditionValues);
    return result.affectedRows;
  },

  findOne: async ({ table, where }) => {
    const keys = Object.keys(where);
    const values = Object.values(where);

    const conditions = keys.map(key => `${key} = ?`).join(" AND ");

    const sql = `SELECT * FROM ${table} WHERE ${conditions} LIMIT 1`;

    const [rows] = await pool.promise().query(sql, values);
    return rows.length ? rows[0] : null;
  },

  rawQuery: (query, params = [], trx = null) => {
    return new Promise((resolve, reject) => {
      const conn = trx || pool;   // use transaction connection OR normal db

      conn.query(query, params, (err, result) => {
        if (err) {
          console.error("SQL ERROR →", err.sqlMessage || err);
          return reject(err);
        }
        resolve(result);
      });
    });
  },


};
