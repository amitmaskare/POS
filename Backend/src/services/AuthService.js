import { AuthModel } from "../models/AuthModel.js";
import { CommonModel } from "../models/CommonModel.js";
import bcrypt from "bcrypt";
import pool from "../config.js";
import jwt from "jsonwebtoken";
import { normalizeDeviceId, compareDeviceIds, isValidDeviceId } from "../utils/DeviceUtils.js";

import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
export const AuthService = {

  getNextUserId:async()=> {
  const [rows] = await pool.promise().query("SELECT MAX(user_id) as maxId FROM users");
  return (rows[0].maxId || 999) + 1; 
  },

  signup: async (userData) => {
  
      const {name, email, password, role } = userData;
      const checkDuplicateEmail="email.ocom"
      const hashPassword = await bcrypt.hash(password, 10);
      const user_id= await AuthService.getNextUserId();
      const data = {
        user_id: user_id,
        name: name,
        email: email,
        password: hashPassword,
        role: role,
        created_at: new Date(),
      };
      const result = await CommonModel.insertData({
        table: "users",
        data: data,
      });
      return result;
  },

  loginByPassword: async (loginData) => {
    const { user_id, password, device_id } = loginData;

    const user = await CommonModel.getSingle({
      table: "users",
      conditions: { user_id }
    });

    if (!user) throw new Error("Invalid User Id");

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) throw new Error("Invalid Password");

    // ✅ DEVICE BINDING LOGIC FOR COUNTER USERS (role = 2)
    if (Number(user.role) === 2) {
      // Counter users must be device-locked
      if (!device_id) {
        throw new Error("Device ID is required for counter users. Please ensure device identifier is sent.");
      }

      // Validate device ID format (supports MAC, Windows GUID, Linux Machine ID, etc.)
      if (!isValidDeviceId(device_id)) {
        throw new Error("Invalid device ID format. Please check your device configuration.");
      }

      const normalizedDeviceId = normalizeDeviceId(device_id);

      // First login - bind device
      if (!user.device_id || !user.device_locked) {
        await CommonModel.updateData({
          table: "users",
          data: {
            device_id: normalizedDeviceId,
            device_locked: 1,
            first_login_at: new Date(),
            last_login_at: new Date()
          },
          conditions: { userId: user.userId }
        });
        user.device_id = normalizedDeviceId;
        user.device_locked = 1;
      }
      // Subsequent logins - verify device
      else {
        if (!compareDeviceIds(user.device_id, device_id)) {
          throw new Error(
            "This account is locked to another device. Contact your administrator to unlock."
          );
        }
        // Update last login time
        await CommonModel.updateData({
          table: "users",
          data: { last_login_at: new Date() },
          conditions: { userId: user.userId }
        });
      }
    }
    // ✅ SUPER ADMIN (role = 0) - NO STORE VALIDATION
    else if (Number(user.role) === 0) {
      // Super Admin doesn't need store_id
      // Update last login time
      await CommonModel.updateData({
        table: "users",
        data: { last_login_at: new Date() },
        conditions: { userId: user.userId }
      });
    }
    // ✅ STORE ADMIN (role = 1) - VALIDATE STORE_ID EXISTS
    else if (Number(user.role) === 1) {
      if (!user.store_id) {
        throw new Error("Store ID not assigned to this user. Contact Super Administrator.");
      }
      // Update last login time
      await CommonModel.updateData({
        table: "users",
        data: { last_login_at: new Date() },
        conditions: { userId: user.userId }
      });
    }

    const role = await CommonModel.getSingle({
      table: "roles",
      conditions: { roleId: user.role }
    });

    let permissions = [];

    // ✅ SUPER ADMIN & STORE ADMIN → ALL PERMISSIONS
    if (Number(user.role) === 0 || Number(user.role) === 1 || role?.name === "admin" || role?.name === "super_admin") {
      const allPerms = await CommonModel.getAllData({ table: "permissions" });
      permissions = allPerms.map(p => p.slug_url);
    }
    // ✅ CHECK USER-SPECIFIC PERMISSIONS FIRST
    else {
      // Check if user has custom permissions
      const userPermissionsQuery = `
        SELECT p.slug_url
        FROM user_permissions up
        JOIN permissions p ON p.permissionId = up.permission_id
        WHERE up.user_id = ?
      `;

      const userPermResult = await CommonModel.rawQuery(
        userPermissionsQuery,
        [user.userId]
      );

      const userPerms = Array.isArray(userPermResult[0])
        ? userPermResult[0]
        : userPermResult;

      // If user has custom permissions, use them
      if (userPerms && userPerms.length > 0) {
        permissions = userPerms.map(p => p.slug_url);
      }
      // Otherwise, fall back to role permissions
      else {
        const rolePermissionsQuery = `
          SELECT p.slug_url
          FROM role_permissions rp
          JOIN permissions p ON p.permissionId = rp.permission_id
          WHERE rp.role_id = ?
        `;

        const rolePermResult = await CommonModel.rawQuery(
          rolePermissionsQuery,
          [user.role]
        );

        const rolePerms = Array.isArray(rolePermResult[0])
          ? rolePermResult[0]
          : rolePermResult;

        permissions = rolePerms.map(p => p.slug_url);
      }
    }

    delete user.password;

    return {
      ...user,
      role_name: role?.name || "admin",
      permissions,
      store_id: user.store_id
    };
  },
  

  Profile: async (userId) => {
    const user = await AuthModel.getById(userId);
    if (!user) {
      throw new Error("User Not Found");
    }
    return user;
  },

  updateprofile: async (userId, name, email) => {
    try {
      const sql = "UPDATE users SET name=? ,email=? WHERE userId=?";
      const [result] = await pool.promise().query(sql, [name, email, userId]);
      if (result.affectedRows === 0) {
        throw new Error("Profile update failed");
      }
    } catch (err) {
      console.log("Error", err);
      throw err;
    }
  },

  resetPassword: async (
    userId,
    currentPassword,
    newPassword,
    confirmPassword
  ) => {
    const user = await AuthModel.getById(userId);
    if (!user) {
      throw new Error("User Not Found");
    }
    const oldPassword = await bcrypt.compare(currentPassword, user.password);
    if (!oldPassword) {
      throw new Error("Current Password Incorrect");
    }
    if (newPassword.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }
    if (newPassword !== confirmPassword) {
      throw new Error("Password does not match");
    }

    const new_password = await bcrypt.hash(newPassword, 10);
    try {
      const sql = "UPDATE users SET password = ? WHERE userId = ?";
      const [result] = await pool.promise().query(sql, [new_password, userId]);
      if (result.affectedRows === 0) {
        throw new Error("Password update failed");
      }
    } catch (err) {
      console.log("Error", err);
      throw err;
    }
  },

  generateForgotPasswordLink: async (email) => {
    const user = await AuthModel.getByEmail(email);
    if (!user) {
      throw new Error("checkEmail");
    }
   // const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "15m" });
   const encodedEmail = encodeURIComponent(email);
    const link = `${process.env.CLIENT_URL}/forgot-password?email=${encodedEmail}`;
    return link;
  },

  forgotPassword: async (token, newPassword, confirmPassword) => {
    try {
      // const decode = jwt.verify(token, JWT_SECRET);
      // const email = decode.email;
       const email =token;
      if (newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }
      if (newPassword !== confirmPassword) {
        throw new Error("Password does not match");
      }
      const new_password = await bcrypt.hash(newPassword, 10);
      const result = await CommonModel.updateData({
        table: "users",
        data: { password: new_password },
        conditions: { email },
      });
      if (result === 0) {
        throw new Error("Something went wrong");
      }
    } catch (err) {
      throw new Error("Error : " + err.message);
    }
  },

  userList:async(requestingUser)=>{
    let sql = `
      SELECT
        u.userId,
        u.user_id,
        u.name,
        u.email,
        u.role,
        u.store_id,
        u.device_id,
        u.device_locked,
        u.first_login_at,
        u.last_login_at,
        CASE
          WHEN u.role = 0 THEN 'Super Admin'
          WHEN u.role = 1 THEN 'Store Admin'
          WHEN u.role = 2 THEN 'Cashier'
          ELSE COALESCE(r.name, 'Unknown')
        END as roleName,
        s.counter_limit,
        s.store_name,
        (SELECT COUNT(*) FROM users WHERE store_id = u.store_id AND role = 2) as counter_count,
        u.created_at
      FROM users u
      LEFT JOIN roles r ON u.role = r.roleId
      LEFT JOIN stores s ON u.store_id = s.store_id
    `;

    const queryParams = [];

    // Filter based on requesting user's role
    if (requestingUser.role === 'super_admin') {
      // Super admin sees ALL users
      sql += ` ORDER BY u.role ASC, u.created_at DESC`;
    } else if (requestingUser.role === 'admin') {
      // Store admin sees ONLY cashiers from their store (role = 2)
      // CANNOT see super admin (role = 0) or other admins (role = 1)
      sql += ` WHERE u.store_id = ? AND u.role = 2 ORDER BY u.created_at DESC`;
      queryParams.push(requestingUser.store_id);
    } else {
      // Cashiers and other roles cannot see user list
      return [];
    }

    const [result] = await pool.promise().query(sql, queryParams);
    return result;
  },

  add: async (userData, requestingUser) => {
    const { name, email, role, store_name, phone, address, counter_limit } = userData;

    // If role is Store Admin (1), use createStoreAdmin method
    // Only super admin can create store admins with new stores
    if (parseInt(role) === 1) {
      if (requestingUser && requestingUser.role === 'super_admin') {
        return await AuthService.createStoreAdmin(
          { name, email, password: '123456', counter_limit: counter_limit || 5 },
          { store_name, phone, address },
          requestingUser.userId
        );
      } else if (requestingUser && requestingUser.role === 'admin') {
        // Store admin creating sub-admin
        return await AuthService.createSubAdmin(
          { name, email, password: '123456' },
          requestingUser.store_id,
          requestingUser.userId
        );
      } else {
        throw new Error("Insufficient permissions to create admin users");
      }
    }

    // For cashiers (role = 2)
    if (parseInt(role) === 2) {
      if (requestingUser && requestingUser.role === 'admin') {
        // Get current counter count
        const counterUsers = await AuthService.getCounterUsers(requestingUser.store_id);
        return await AuthService.createCounterUser(
          { name, email, password: '123456' },
          requestingUser.store_id,
          counterUsers.length,
          requestingUser.userId
        );
      } else {
        throw new Error("Only store admins can create cashiers");
      }
    }

    // For other roles (managers, etc.) - legacy support
    const hashPassword = await bcrypt.hash('123456', 10);
    const user_id = await AuthService.getNextUserId();
    const data = {
      user_id: user_id,
      name: name,
      email: email,
      password: hashPassword,
      role: role,
      store_id: requestingUser ? requestingUser.store_id : null,
      created_by: requestingUser ? requestingUser.userId : null,
      created_at: new Date(),
    };
    const result = await CommonModel.insertData({
      table: "users",
      data: data,
    });
    return result;
  },

getById: async (userId) => {
  // Get user with store information
  const sql = `
    SELECT
      u.*,
      s.store_name,
      s.phone,
      s.address,
      s.counter_limit
    FROM users u
    LEFT JOIN stores s ON u.store_id = s.store_id
    WHERE u.userId = ?
  `;
  const [result] = await pool.promise().query(sql, [userId]);
  return result[0] || null;
},

update: async (data) => {
  const { userId, name, email, role, store_name, phone, address, counter_limit } = data;

  // Update user information
  const userData = { name, email, role };
  const userResult = await CommonModel.updateData({
    table: "users",
    data: userData,
    conditions: { userId }
  });

  // If role is Store Admin (1), also update store information
  if (parseInt(role) === 1) {
    // Get user's store_id
    const user = await CommonModel.getSingle({
      table: "users",
      conditions: { userId }
    });

    if (user && user.store_id) {
      // Update store information
      const storeData = {
        store_name: store_name,
        phone: phone,
        address: address,
        counter_limit: counter_limit || 5,
        updated_at: new Date()
      };

      await CommonModel.updateData({
        table: "stores",
        data: storeData,
        conditions: { store_id: user.store_id }
      });
    }
  }

  return userResult;
},

deleteData:async(userId)=>{
  const result=await CommonModel.deleteData({table:"users",conditions:{userId}})
  return result
},

// ======================== SUPER ADMIN METHODS ========================

/**
 * Create Store Admin with counter limit
 * Only Super Admin can call this
 */
createStoreAdmin: async (adminData, storeData, createdBy = null) => {
  const { name, email, password, counter_limit } = adminData;
  const { store_name, phone, address } = storeData;

  // Check if email already exists
  const existingUser = await AuthModel.getByEmail(email);
  if (existingUser) {
    throw new Error("Email already exists");
  }

  try {
    await pool.promise().query("START TRANSACTION");

    // Generate next store_id
    const [storeRows] = await pool.promise().query(
      "SELECT MAX(CAST(SUBSTRING(store_id, 6) AS UNSIGNED)) as maxId FROM stores WHERE store_id LIKE 'STORE%'"
    );
    const nextStoreNum = (storeRows[0]?.maxId || 999) + 1;
    const store_id = `STORE${nextStoreNum}`;

    // Create store
    const storeResult = await CommonModel.insertData({
      table: "stores",
      data: {
        store_name,
        store_id,
        phone,
        address,
        counter_limit: counter_limit || 5,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    // Create admin user
    const hashPassword = await bcrypt.hash(password, 10);
    const user_id = await AuthService.getNextUserId();

    const userResult = await CommonModel.insertData({
      table: "users",
      data: {
        user_id,
        name,
        email,
        password: hashPassword,
        role: 1, // Store Admin
        store_id,
        created_by: createdBy, // Track who created this admin (super admin)
        device_locked: 0,
        created_at: new Date()
      }
    });

    await pool.promise().query("COMMIT");

    return {
      user_id,
      store_id,
      message: "Store Admin created successfully"
    };
  } catch (error) {
    await pool.promise().query("ROLLBACK");
    throw error;
  }
},

/**
 * Update counter limit for a store
 * Only Super Admin can call this
 */
updateCounterLimit: async (storeId, newLimit) => {
  const result = await CommonModel.updateData({
    table: "stores",
    data: { counter_limit: newLimit },
    conditions: { store_id: storeId }
  });
  return result;
},

/**
 * Get all stores with admin info
 * Only Super Admin can call this
 */
getAllStoresWithAdmins: async () => {
  const sql = `
    SELECT
      s.id,
      s.store_id,
      s.store_name,
      s.phone,
      s.address,
      s.counter_limit,
      s.created_at,
      u.userId as admin_user_id,
      u.user_id as admin_login_id,
      u.name as admin_name,
      u.email as admin_email,
      (SELECT COUNT(*) FROM users WHERE store_id = s.store_id AND role = 2) as counter_count
    FROM stores s
    LEFT JOIN users u ON s.store_id = u.store_id AND u.role = 1
    ORDER BY s.created_at DESC
  `;
  const [result] = await pool.promise().query(sql);
  return result;
},

// ======================== STORE ADMIN METHODS ========================

/**
 * Create Sub-Admin
 * Store Admin can create additional admins for the same store
 */
createSubAdmin: async (adminData, storeId, createdBy) => {
  const { name, email, password } = adminData;

  // Check if email already exists
  const existingUser = await AuthModel.getByEmail(email);
  if (existingUser) {
    throw new Error("Email already exists");
  }

  // Verify store exists
  const store = await CommonModel.getSingle({
    table: "stores",
    conditions: { store_id: storeId }
  });

  if (!store) {
    throw new Error("Store not found");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const user_id = await AuthService.getNextUserId();

  const result = await CommonModel.insertData({
    table: "users",
    data: {
      user_id,
      name,
      email,
      password: hashPassword,
      role: 1, // Store Admin
      store_id: storeId,
      created_by: createdBy, // Track who created this admin
      device_locked: 0,
      created_at: new Date()
    }
  });

  return { user_id, message: "Sub-admin created successfully" };
},

/**
 * Create Counter User
 * Only Store Admin can call this
 */
createCounterUser: async (userData, storeId, currentCounterCount, createdBy) => {
  const { name, email, password } = userData;

  // Get store's counter limit
  const store = await CommonModel.getSingle({
    table: "stores",
    conditions: { store_id: storeId }
  });

  if (!store) {
    throw new Error("Store not found");
  }

  if (currentCounterCount >= store.counter_limit) {
    throw new Error(
      `Counter limit reached. Maximum ${store.counter_limit} counter users allowed. Contact Super Admin to increase limit.`
    );
  }

  // Check if email already exists
  const existingUser = await AuthModel.getByEmail(email);
  if (existingUser) {
    throw new Error("Email already exists");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const user_id = await AuthService.getNextUserId();

  const result = await CommonModel.insertData({
    table: "users",
    data: {
      user_id,
      name,
      email,
      password: hashPassword,
      role: 2, // Counter User
      store_id: storeId,
      created_by: createdBy, // Track who created this cashier
      device_locked: 0,
      device_id: null,
      created_at: new Date()
    }
  });

  return { user_id, message: "Counter user created successfully" };
},

/**
 * Get counter users for a store
 * Only Store Admin can call this
 */
getCounterUsers: async (storeId) => {
  const sql = `
    SELECT
      userId,
      user_id,
      name,
      email,
      device_id,
      device_locked,
      first_login_at,
      last_login_at,
      created_at
    FROM users
    WHERE store_id = ? AND role = 2
    ORDER BY created_at DESC
  `;
  const [result] = await pool.promise().query(sql, [storeId]);
  return result;
},

/**
 * Unbind device from counter user
 * Only Store Admin can call this
 * This will immediately invalidate the user's session
 */
unbindDevice: async (userId, storeId) => {
  // Verify the user belongs to this store
  const user = await CommonModel.getSingle({
    table: "users",
    conditions: { userId, store_id: storeId, role: 2 }
  });

  if (!user) {
    throw new Error("Counter user not found or access denied");
  }

  if (!user.device_locked) {
    throw new Error("This user is not device-locked");
  }

  // Unbind device
  await CommonModel.updateData({
    table: "users",
    data: {
      device_id: null,
      device_locked: 0,
      first_login_at: null
    },
    conditions: { userId }
  });

  // Invalidate active sessions for this user (immediate logout)
  await pool.promise().query(
    "UPDATE active_sessions SET is_active = 0 WHERE user_id = ?",
    [userId]
  );

  return { message: "Device unbound successfully. User has been logged out." };
},

/**
 * Get store info with counter usage
 */
getStoreInfo: async (storeId) => {
  const sql = `
    SELECT
      s.*,
      (SELECT COUNT(*) FROM users WHERE store_id = s.store_id AND role = 2) as counter_count
    FROM stores s
    WHERE s.store_id = ?
  `;
  const [result] = await pool.promise().query(sql, [storeId]);
  return result[0];
},

};
