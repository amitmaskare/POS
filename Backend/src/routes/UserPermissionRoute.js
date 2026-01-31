import { UserPermissionController } from "../controllers/UserPermissionController.js";
import express from 'express';
import AuthMiddleware from "../middleware/AuthMiddleware.js";

const route = express.Router();

route.use(AuthMiddleware);

// Get user permissions
route.get('/userpermission/:userId', UserPermissionController.getUserPermissions);

// Get all permissions grouped
route.get('/userpermission/permissions/grouped', UserPermissionController.getAllPermissionsGrouped);

// Update user permissions
route.post('/userpermission/update', UserPermissionController.updateUserPermissions);

// Copy role permissions to user
route.post('/userpermission/copy-from-role', UserPermissionController.copyRolePermissionsToUser);

// Check if user has custom permissions
route.get('/userpermission/has-custom/:userId', UserPermissionController.hasCustomPermissions);

export default route;
