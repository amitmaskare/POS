import mysql from "mysql2";
import bcrypt from "bcrypt";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "POS",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const name = "Admin";
const user_id = 1000;
const email = "admin@gmail.com";
const password = "123456";
const created_at = new Date();
const saltRounds = 10;

// First check if table has any data
pool.query("SELECT COUNT(*) AS count FROM users", (err, results) => {
  if (err) {
    console.error("Error checking table:", err);

    return;
  }

  if (results[0].count > 0) {
    console.log("Users table already has data, skipping insert.");
    // connection.end();
    return;
  }

  // Table is empty → insert admin user
  bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
    if (err) {
      console.error("Error hashing password:", err);
      //  connection.end();
      return;
    }

    const sql =
      "INSERT INTO users (user_id,name, email, password,role, created_at) VALUES (?,?, ?, ?, ?,?)";
    const values = [user_id,name, email, hashedPassword,1, created_at];

    pool.query(sql, values, (err, result) => {
      if (err) {
        console.error("Error inserting data:", err);

        return;
      }
      console.log("Admin user inserted with ID:", result.insertId);
    });
  });
});

export default pool;
