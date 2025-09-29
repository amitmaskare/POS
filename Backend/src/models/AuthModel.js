import pool from "../config.js";

export const AuthModel = {
  findByPassword: async () => {
    const [rows] = await pool.promise().query("SELECT * FROM users");
    return rows;
  },

  getById: async (userId) => {
    const [rows] = await pool
      .promise()
      .query("SELECT * FROM users WHERE userId=?", [userId]);
    return rows[0];
  },

  getByEmail: async (email) => {
    const [rows] = await pool
      .promise()
      .query("SELECT * FROM users WHERE email=?", [email]);
    return rows[0];
  },
};
