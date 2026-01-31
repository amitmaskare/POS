import { RolePermissionController } from "../controllers/RolePermissionController.js";
import express from 'express'
import AuthMiddleware from "../middleware/AuthMiddleware.js";

const route = express.Router()

route.use(AuthMiddleware)
route.get('/rolepermission/list',RolePermissionController.list)
route.get('/rolepermission/permissions-grouped', RolePermissionController.getAllPermissionsGrouped)
route.get("/rolepermission/getById/:id",RolePermissionController.getById)
route.post("/rolepermission/giveRolePermission",RolePermissionController.giveRolePermission)
route.post("/rolepermission/update", RolePermissionController.updateRolePermissions)

export default route