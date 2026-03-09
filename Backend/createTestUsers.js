import pool from "./src/config.js";
import bcrypt from "bcrypt";

const createTestUsers = async () => {
  try {
    console.log("Creating test users...");

    // Test users data
    const users = [
      {
        user_id: 1001,
        name: "Manager John",
        email: "manager@gmail.com",
        password: "123456",
        role: 2, // Manager role
      },
      {
        user_id: 1002,
        name: "Cashier Sarah",
        email: "cashier@gmail.com",
        password: "123456",
        role: 3, // Cashier role
      },
      {
        user_id: 1003,
        name: "Sales Person Mike",
        email: "sales@gmail.com",
        password: "123456",
        role: 4, // Sales role
      },
      {
        user_id: 1004,
        name: "Inventory Manager Lisa",
        email: "inventory@gmail.com",
        password: "123456",
        role: 2, // Manager role but will have different permissions
      },
    ];

    // Insert users
    for (const user of users) {
      // Check if user already exists
      const [existing] = await pool
        .promise()
        .query("SELECT user_id FROM users WHERE user_id = ?", [user.user_id]);

      if (existing.length > 0) {
        console.log(`User ${user.name} already exists, skipping...`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(user.password, 10);
      const sql =
        "INSERT INTO users (user_id, name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?)";
      const values = [
        user.user_id,
        user.name,
        user.email,
        hashedPassword,
        user.role,
        new Date(),
      ];

      await pool.promise().query(sql, values);
      console.log(`✓ Created user: ${user.name} (${user.email})`);
    }

    console.log("\n=== Test Users Created ===");
    console.log("\nLogin Details:");
    console.log("1. Admin (Full Access)");
    console.log("   User ID: 1000");
    console.log("   Password: 123456");
    console.log("");
    console.log("2. Manager John (Manager permissions)");
    console.log("   User ID: 1001");
    console.log("   Password: 123456");
    console.log("");
    console.log("3. Cashier Sarah (Limited POS access)");
    console.log("   User ID: 1002");
    console.log("   Password: 123456");
    console.log("");
    console.log("4. Sales Person Mike (Sales only)");
    console.log("   User ID: 1003");
    console.log("   Password: 123456");
    console.log("");
    console.log("5. Inventory Manager Lisa (Inventory focus)");
    console.log("   User ID: 1004");
    console.log("   Password: 123456");

    // Now let's assign different permissions to each user
    console.log("\n\nAssigning custom permissions...");

    // Get actual userId values for our test users
    const [userRecords] = await pool
      .promise()
      .query("SELECT userId, user_id, name FROM users WHERE user_id IN (1002, 1003, 1004)");

    const userIdMap = {};
    userRecords.forEach(user => {
      userIdMap[user.user_id] = user.userId;
    });

    console.log("User ID mapping:", userIdMap);

    // Get all permissions
    const [allPermissions] = await pool
      .promise()
      .query("SELECT permissionId, name, slug_url FROM permissions");

    console.log(`Found ${allPermissions.length} total permissions`);

    // Cashier Sarah (user_id: 1002) - Only POS, sales, customer, and view products
    const cashierPermissions = allPermissions.filter(
      (p) =>
        p.slug_url.includes("pos") ||
        p.slug_url.includes("sale") ||
        p.slug_url.includes("customer") ||
        (p.slug_url.includes("product") &&
          (p.slug_url.includes("view") || p.slug_url.includes("list")))
    );
    await assignPermissionsToUser(userIdMap[1002], cashierPermissions);
    console.log(
      `✓ Assigned ${cashierPermissions.length} permissions to Cashier Sarah (userId: ${userIdMap[1002]})`
    );

    // Sales Person Mike (user_id: 1003) - Sales, customers, and view products only
    const salesPermissions = allPermissions.filter(
      (p) =>
        p.slug_url.includes("sale") ||
        p.slug_url.includes("customer") ||
        (p.slug_url.includes("product") &&
          (p.slug_url.includes("view") || p.slug_url.includes("list")))
    );
    await assignPermissionsToUser(userIdMap[1003], salesPermissions);
    console.log(
      `✓ Assigned ${salesPermissions.length} permissions to Sales Person Mike (userId: ${userIdMap[1003]})`
    );

    // Inventory Manager Lisa (user_id: 1004) - Inventory, products, purchases, receiving
    const inventoryPermissions = allPermissions.filter(
      (p) =>
        p.slug_url.includes("inventory") ||
        p.slug_url.includes("product") ||
        p.slug_url.includes("purchase") ||
        p.slug_url.includes("receiving") ||
        p.slug_url.includes("supplier")
    );
    await assignPermissionsToUser(userIdMap[1004], inventoryPermissions);
    console.log(
      `✓ Assigned ${inventoryPermissions.length} permissions to Inventory Manager Lisa (userId: ${userIdMap[1004]})`
    );

    console.log("\n✅ All test users created and permissions assigned!");
    console.log(
      "\nYou can now login with any of the above credentials and see different menus based on permissions."
    );

    process.exit(0);
  } catch (error) {
    console.error("Error creating test users:", error);
    process.exit(1);
  }
};

// Helper function to assign permissions to a user
const assignPermissionsToUser = async (userId, permissions) => {
  try {
    // First, delete existing permissions for this user
    await pool
      .promise()
      .query("DELETE FROM user_permissions WHERE user_id = ?", [userId]);

    // Then insert new permissions
    if (permissions.length > 0) {
      const values = permissions.map((p) => [userId, p.permissionId]);
      await pool
        .promise()
        .query(
          "INSERT INTO user_permissions (user_id, permission_id) VALUES ?",
          [values]
        );
    }
  } catch (error) {
    console.error(`Error assigning permissions to user ${userId}:`, error);
    throw error;
  }
};

createTestUsers();
