import { sendResponse } from "../utils/sendResponse.js";
import { SettingsService } from "../services/SettingsService.js";
import { getStoreIdFromRequest } from "../utils/storeHelper.js";
import createuploadFile from "../utils/uploadFile.js";
import dotenv from "dotenv";

dotenv.config();
const baseUrl = process.env.BASE_URL;
const upload = createuploadFile("settings");

export const SettingsController = {

  // Get all settings as array
  list: async (req, resp) => {
    try {
      const storeId = getStoreIdFromRequest(req);

      if (!storeId) {
        return sendResponse(resp, false, 400, "Store ID not found");
      }

      let result = await SettingsService.list(storeId);

      // If no settings found, return empty array instead of error
      if (!result || result.length === 0) {
        return sendResponse(resp, true, 200, "No settings found, please configure", []);
      }

      return sendResponse(resp, true, 200, "Settings fetched successfully", result);
    } catch (error) {
      return sendResponse(resp, false, 500, `Error: ${error.message}`);
    }
  },

  // Get all settings as key-value object
  getAll: async (req, resp) => {
    try {
      const storeId = getStoreIdFromRequest(req);
      console.log('[Settings] Store ID from request:', storeId);

      if (!storeId) {
        console.log('[Settings] ERROR: No store ID found in request');
        return sendResponse(resp, false, 400, "Store ID not found");
      }

      let result = await SettingsService.getAll(storeId);
      console.log('[Settings] Settings found:', Object.keys(result).length, 'settings');

      // If no settings found, create default settings
      if (!result || Object.keys(result).length === 0) {
        console.log('[Settings] No settings found, creating defaults for store_id:', storeId);

        const defaultSettings = {
          project_name: 'My POS System',
          contact_number: '',
          address: '',
          gst_number: '',
          logo_url: '',
          enable_sales_return: 'true',
          enable_discounts: 'true',
          enable_multiple_payment: 'true',
          enable_stock_alerts: 'true',
          currency: 'INR',
          thermal_printer_width: '80',
          print_header: 'true',
          print_footer: 'true',
          header_message: '',
          footer_message: 'Thank you for your business!',
          timezone: 'Asia/Kolkata'
        };

        try {
          // Create default settings
          await SettingsService.bulkUpdate(defaultSettings, storeId);
          console.log('[Settings] Default settings created successfully');
          result = defaultSettings;
        } catch (createError) {
          console.error('[Settings] ERROR creating defaults:', createError.message);
          // Return defaults even if creation fails, so UI can work
          result = defaultSettings;
        }
      }

      return sendResponse(resp, true, 200, "Settings fetched successfully", result);
    } catch (error) {
      console.error('[Settings] ERROR in getAll:', error.message);
      return sendResponse(resp, false, 500, `Error: ${error.message}`);
    }
  },

  // Get a single setting by key
  getByKey: async (req, resp) => {
    try {
      const { key } = req.params;
      const storeId = getStoreIdFromRequest(req);

      if (!key) {
        return sendResponse(resp, false, 400, "Setting key is required");
      }

      const result = await SettingsService.getByKey(key, storeId);

      if (!result) {
        return sendResponse(resp, false, 404, "Setting not found");
      }

      return sendResponse(resp, true, 200, "Setting fetched successfully", result);
    } catch (error) {
      return sendResponse(resp, false, 500, `Error: ${error.message}`);
    }
  },

  // Update or insert a single setting
  upsert: async (req, resp) => {
    try {
      const { key, value } = req.body;
      const storeId = getStoreIdFromRequest(req);

      if (!key) {
        return sendResponse(resp, false, 400, "Setting key is required");
      }

      if (value === undefined || value === null) {
        return sendResponse(resp, false, 400, "Setting value is required");
      }

      const result = await SettingsService.upsert(key, value, storeId);

      if (!result) {
        return sendResponse(resp, false, 400, "Setting update failed");
      }

      return sendResponse(resp, true, 200, "Setting updated successfully");
    } catch (error) {
      return sendResponse(resp, false, 500, `Error: ${error.message}`);
    }
  },

  // Bulk update multiple settings
  bulkUpdate: async (req, resp) => {
    try {
      const { settings } = req.body;
      const storeId = getStoreIdFromRequest(req);

      if (!settings || typeof settings !== "object") {
        return sendResponse(resp, false, 400, "Settings object is required");
      }

      if (Object.keys(settings).length === 0) {
        return sendResponse(resp, false, 400, "Settings object cannot be empty");
      }

      const result = await SettingsService.bulkUpdate(settings, storeId);

      if (!result || !result.success) {
        return sendResponse(resp, false, 400, "Settings update failed");
      }

      return sendResponse(resp, true, 200, "Settings updated successfully");
    } catch (error) {
      return sendResponse(resp, false, 500, `Error: ${error.message}`);
    }
  },

  // Delete a setting
  deleteByKey: async (req, resp) => {
    try {
      const { key } = req.params;
      const storeId = getStoreIdFromRequest(req);

      if (!key) {
        return sendResponse(resp, false, 400, "Setting key is required");
      }

      const result = await SettingsService.deleteByKey(key, storeId);

      if (!result) {
        return sendResponse(resp, false, 400, "Setting delete failed");
      }

      return sendResponse(resp, true, 200, "Setting deleted successfully");
    } catch (error) {
      return sendResponse(resp, false, 500, `Error: ${error.message}`);
    }
  },

  // Get settings by category
  getByCategory: async (req, resp) => {
    try {
      const { category } = req.params;
      const storeId = getStoreIdFromRequest(req);

      if (!category) {
        return sendResponse(resp, false, 400, "Category is required");
      }

      const result = await SettingsService.getByCategory(category, storeId);

      if (!result || result.length === 0) {
        return sendResponse(resp, false, 400, "No Settings Found for this category");
      }

      return sendResponse(resp, true, 200, "Settings fetched successfully", result);
    } catch (error) {
      return sendResponse(resp, false, 500, `Error: ${error.message}`);
    }
  },

  // Upload logo
  uploadLogo: async (req, resp) => {
    upload.single("logo")(req, resp, async (err) => {
      if (err) {
        return sendResponse(resp, false, 400, `Upload Error: ${err.message}`);
      }

      try {
        const storeId = getStoreIdFromRequest(req);

        if (!storeId) {
          return sendResponse(resp, false, 400, "Store ID not found");
        }

        if (!req.file) {
          return sendResponse(resp, false, 400, "No file uploaded");
        }

        const logoFileName = req.file.filename;
        const logoUrl = `${baseUrl}/public/uploads/settings/${logoFileName}`;

        console.log('[Settings] Logo uploaded:', logoFileName);

        // Update logo_url in settings
        await SettingsService.upsert('logo_url', logoUrl, storeId);

        return sendResponse(resp, true, 200, "Logo uploaded successfully", {
          logo_url: logoUrl,
          filename: logoFileName
        });
      } catch (error) {
        console.error('[Settings] Logo upload error:', error.message);
        return sendResponse(resp, false, 500, `Error: ${error.message}`);
      }
    });
  }

};
