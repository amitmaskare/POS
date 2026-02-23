import {CommonModel} from "../models/CommonModel.js"
import pool from "../config.js"

export const RolePermissionService={

   list:async()=>{
      const sql = `
  SELECT
    MAX(rp.id) AS id,
    rp.role_id,
    MAX(rp.updated_at) AS updated_at,
    r.name AS role_name
  FROM role_permissions rp
  LEFT JOIN roles r ON r.roleId = rp.role_id
  GROUP BY rp.role_id
`;

const [result] = await pool.promise().query(sql);
return result;
   },

   // Get all permissions grouped by module
   getAllPermissionsGrouped: async () => {
      const [permissions] = await pool.promise().query(
         'SELECT permissionId, name, slug_url FROM permissions ORDER BY permissionId'
      );

      // Group permissions by module (extract module name from slug_url)
      const grouped = {};

      permissions.forEach(perm => {
         // Extract module name from slug like "view-product" -> "product"
         const parts = perm.slug_url.split('-');
         const action = parts[0]; // view, add, edit, delete, list
         const module = parts.slice(1).join('-'); // product, pos, etc

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

   // Get permissions for a specific role
   getById:async(role_id)=>{
      const sql = `
         SELECT
            rp.id,
            rp.role_id,
            rp.permission_id,
            p.name as permission_name,
            p.slug_url
         FROM role_permissions rp
         LEFT JOIN permissions p ON p.permissionId = rp.permission_id
         WHERE rp.role_id = ?
      `;
      const [result] = await pool.promise().query(sql, [role_id]);
      return result;
   },

   // Update role permissions (replace all for a role)
   updateRolePermissions: async (role_id, permission_ids) => {
      try {
         // Start transaction
         await pool.promise().query('START TRANSACTION');

         // Delete existing permissions for this role
         await pool.promise().query(
            'DELETE FROM role_permissions WHERE role_id = ?',
            [role_id]
         );

         // Insert new permissions
         if (permission_ids && permission_ids.length > 0) {
            const values = permission_ids.map(perm_id => [role_id, perm_id, new Date()]);
            await pool.promise().query(
               'INSERT INTO role_permissions (role_id, permission_id, updated_at) VALUES ?',
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

   giveRolePermission:async(data)=>{

      const result=await CommonModel.insertData({table:'role_permissions',data:data})
      return result
   },


}