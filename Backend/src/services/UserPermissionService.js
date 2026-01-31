import { CommonModel } from "../models/CommonModel.js";
import pool from "../config.js";

export const UserPermissionService = {
  // Get all permissions for a specific user
  getUserPermissions: async (userId) => {
    const sql = `
      SELECT
        up.id,
        up.user_id,
        up.permission_id,
        p.name as permission_name,
        p.slug_url
      FROM user_permissions up
      JOIN permissions p ON p.permissionId = up.permission_id
      WHERE up.user_id = ?
    `;
    const [result] = await pool.promise().query(sql, [userId]);
    return result;
  },

  // Get all permissions grouped by module for UI
  getAllPermissionsGrouped: async () => {
    const [permissions] = await pool.promise().query(
      'SELECT permissionId, name, slug_url FROM permissions ORDER BY permissionId'
    );

    // Group permissions by module
    const grouped = {};

    permissions.forEach(perm => {
      const parts = perm.slug_url.split('-');
      const action = parts[0];
      const module = parts.slice(1).join('-');

      if (!grouped[module]) {
        grouped[module] = {
          module: module,
          moduleName: module.charAt(0).toUpperCase() + module.slice(1).replace(/-/g, ' '),
          permissions: []
        };
      }

      grouped[module].permissions.push({
        permissionId: perm.permissionId,
        name: perm.name,
        slug_url: perm.slug_url,
        action: action
      });
    });

    return Object.values(grouped);
  },

  // Update user permissions (replace all)
  updateUserPermissions: async (userId, permissionIds) => {
    try {
      // Start transaction
      await pool.promise().query('START TRANSACTION');

      // Delete existing user permissions
      await pool.promise().query(
        'DELETE FROM user_permissions WHERE user_id = ?',
        [userId]
      );

      // Insert new permissions
      if (permissionIds && permissionIds.length > 0) {
        const values = permissionIds.map(permId => [userId, permId]);
        await pool.promise().query(
          'INSERT INTO user_permissions (user_id, permission_id) VALUES ?',
          [values]
        );
      }

      // Commit transaction
      await pool.promise().query('COMMIT');
      return true;
    } catch (error) {
      // Rollback on error
      await pool.promise().query('ROLLBACK');
      throw error;
    }
  },

  // Copy role permissions to user (as a starting point)
  copyRolePermissionsToUser: async (userId, roleId) => {
    try {
      // Get all permissions for the role
      const sql = `
        SELECT permission_id
        FROM role_permissions
        WHERE role_id = ?
      `;
      const [rolePerms] = await pool.promise().query(sql, [roleId]);

      if (rolePerms.length > 0) {
        const permissionIds = rolePerms.map(rp => rp.permission_id);
        await UserPermissionService.updateUserPermissions(userId, permissionIds);
      }

      return true;
    } catch (error) {
      throw error;
    }
  },

  // Check if user has custom permissions
  hasCustomPermissions: async (userId) => {
    const [result] = await pool.promise().query(
      'SELECT COUNT(*) as count FROM user_permissions WHERE user_id = ?',
      [userId]
    );
    return result[0].count > 0;
  }
};
