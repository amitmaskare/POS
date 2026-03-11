import { SettingsController } from "../controllers/SettingsController.js";
import express from "express";
import AuthMiddleware from "../middleware/AuthMiddleware.js";
import { Permission } from "../middleware/Permission.js";

const route = express.Router();

route.use(AuthMiddleware);

// Get all settings as array (admin or with permission)
route.get("/settings/list", (req, res, next) => {
  if (req.user.role === "admin") return next();
  return Permission("view-settings")(req, res, next);
}, SettingsController.list);

// Get all settings as key-value object (admin or with permission)
route.get("/settings/all", (req, res, next) => {
  if (req.user.role === "admin") return next();
  return Permission("view-settings")(req, res, next);
}, SettingsController.getAll);

// Get single setting by key (admin or with permission)
route.get("/settings/get/:key", (req, res, next) => {
  if (req.user.role === "admin") return next();
  return Permission("view-settings")(req, res, next);
}, SettingsController.getByKey);

// Update or insert a single setting (admin or with permission)
route.post("/settings/upsert", (req, res, next) => {
  if (req.user.role === "admin") return next();
  return Permission("edit-settings")(req, res, next);
}, SettingsController.upsert);

// Bulk update multiple settings (admin or with permission)
route.post("/settings/bulkUpdate", (req, res, next) => {
  if (req.user.role === "admin") return next();
  return Permission("edit-settings")(req, res, next);
}, SettingsController.bulkUpdate);

// Delete a setting (admin or with permission)
route.delete("/settings/delete/:key", (req, res, next) => {
  if (req.user.role === "admin") return next();
  return Permission("delete-settings")(req, res, next);
}, SettingsController.deleteByKey);

// Get settings by category (admin or with permission)
route.get("/settings/category/:category", (req, res, next) => {
  if (req.user.role === "admin") return next();
  return Permission("view-settings")(req, res, next);
}, SettingsController.getByCategory);

// Upload logo
route.post("/settings/uploadLogo", (req, res, next) => {
  if (req.user.role === "admin") return next();
  return Permission("edit-settings")(req, res, next);
}, SettingsController.uploadLogo);

// Debug endpoint - check store_id and database
route.get("/settings/debug", AuthMiddleware, async (req, res) => {
  try {
    const storeId = req.user?.store_id;
    const userId = req.user?.userId;

    res.json({
      success: true,
      debug: {
        user: {
          userId: userId,
          storeId: storeId,
          role: req.user?.role,
          hasStoreId: !!storeId
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

export default route;
