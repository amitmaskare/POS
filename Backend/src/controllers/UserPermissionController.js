import { UserPermissionService } from "../services/UserPermissionService.js";
import { sendResponse } from "../utils/sendResponse.js";

export const UserPermissionController = {
  // Get user permissions
  getUserPermissions: async (req, resp) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return sendResponse(resp, false, 400, "userId is required");
      }

      const result = await UserPermissionService.getUserPermissions(userId);
      return sendResponse(resp, true, 200, "User permissions fetched successfully", result);
    } catch (error) {
      return sendResponse(resp, false, 500, `Error: ${error.message}`);
    }
  },

  // Get all permissions grouped (for UI)
  getAllPermissionsGrouped: async (req, resp) => {
    try {
      const result = await UserPermissionService.getAllPermissionsGrouped();
      return sendResponse(resp, true, 200, "Permissions fetched successfully", result);
    } catch (error) {
      return sendResponse(resp, false, 500, `Error: ${error.message}`);
    }
  },

  // Update user permissions
  updateUserPermissions: async (req, resp) => {
    try {
      const { userId, permissionIds } = req.body;

      if (!userId) {
        return sendResponse(resp, false, 400, "userId is required");
      }

      if (!Array.isArray(permissionIds)) {
        return sendResponse(resp, false, 400, "permissionIds must be an array");
      }

      await UserPermissionService.updateUserPermissions(userId, permissionIds);

      return sendResponse(resp, true, 200, "User permissions updated successfully");
    } catch (error) {
      return sendResponse(resp, false, 500, `Error: ${error.message}`);
    }
  },

  // Copy role permissions to user
  copyRolePermissionsToUser: async (req, resp) => {
    try {
      const { userId, roleId } = req.body;

      if (!userId || !roleId) {
        return sendResponse(resp, false, 400, "userId and roleId are required");
      }

      await UserPermissionService.copyRolePermissionsToUser(userId, roleId);

      return sendResponse(resp, true, 200, "Role permissions copied to user successfully");
    } catch (error) {
      return sendResponse(resp, false, 500, `Error: ${error.message}`);
    }
  },

  // Check if user has custom permissions
  hasCustomPermissions: async (req, resp) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return sendResponse(resp, false, 400, "userId is required");
      }

      const hasCustom = await UserPermissionService.hasCustomPermissions(userId);

      return sendResponse(resp, true, 200, "Check completed", { hasCustomPermissions: hasCustom });
    } catch (error) {
      return sendResponse(resp, false, 500, `Error: ${error.message}`);
    }
  }
};
