import { sendResponse } from "../utils/sendResponse.js";
import { StoreService } from "../services/StoreService.js";
import fs from "fs";
import dotenv from "dotenv";
import createuploadFile from "../utils/uploadFile.js";
import path from "path";
dotenv.config();
const upload = createuploadFile("store");
const baseUrl = process.env.BASE_URL;

export const StoreController = {
  list: async (req, resp) => {
    try {
      const result = await StoreService.list();

      if (!result || result.length === 0) {
        return sendResponse(resp, false, 400, "No Data Found");
      }
      return sendResponse(resp, true, 200, "Fetch store data", result);
    } catch (error) {
      return sendResponse(resp, false, 500, `Error :${error.message}`);
    }
  },

  add: async (req, resp) => {
    upload.single("logo")(req, resp, async (err) => {
      if (err) {
        return sendResponse(resp, false, 400, `Upload Error: ${err.message}`);
      }

      const requiredFields = [
        "ownerId",
        "store_name",
        "phone",
        "address",
        "gst",
        "tax",
        "city",
        "location",
        "pincode",
        "type",
        "branding",
        "business_name",
        "gst_number",
        "email",
      ];
      for (let field of requiredFields) {
        if (!req.body[field]) {
          return sendResponse(resp, false, 400, `${field} is required`);
        }
      }

      const {
        ownerId,
        store_name,
        phone,
        address,
        gst,
        tax,
        city,
        location,
        pincode,
        currency,
        address_proof,
        type,
        branding,
        business_name,
        gst_number,
        vat,
        website,
        email,
      } = req.body;

      try {
        const imageUrl = req.file ? req.file.filename : null;
        const store_id = await StoreService.getNextStoreId();
        const saveData = {
          ownerId: ownerId,
          store_id: store_id,
          store_name: store_name,
          phone: phone,
          address: address,
          gst: gst,
          tax: tax,
          city: city,
          location: location,
          pincode: pincode,
          currency: currency,
          address_proof: address_proof,
          type: type,
          branding: Array.isArray(branding) ? branding.join(", ") : branding,
          business_name: business_name,
          gst_number: gst_number,
          vat: vat ? vat : 0,
          logo: imageUrl,
          website: website,
          email: email,
          created_at: new Date(),
        };
        const result = await StoreService.add(saveData);
        if (!result) {
          return sendResponse(resp, false, 400, "Something went wrong");
        }

        return sendResponse(resp, true, 201, "Store added successful");
      } catch (error) {
        return sendResponse(
          resp,
          false,
          500,
          error.message || "Something wennt Wrong"
        );
      }
    });
  },

  getById: async (req, resp) => {
    try {
      const { id } = req.params;
      const result = await StoreService.getById(id);
      return sendResponse(resp, true, 200, "Fetch get by id", result);
    } catch (error) {
      return sendResponse(resp, false, 500, `Error : ${error.message}`);
    }
  },

  update: async (req, resp) => {
    upload.single("logo")(req, resp, async (err) => {
      try {
        if (err) {
          return sendResponse(resp, false, 400, `Upload Error: ${err.message}`);
        }

        // ✅ Ensure req.body exists (prevents "Cannot convert undefined or null to object")
        req.body = req.body || {};

        const requiredFields = [
          "id",
          "ownerId",
          "store_name",
          "phone",
          "address",
          "gst",
          "tax",
          "city",
          "location",
          "pincode",
          "type",
          "branding",
          "business_name",
          "gst_number",
          "email",
        ];

        for (let field of requiredFields) {
          if (!req.body[field]) {
            return sendResponse(resp, false, 400, `${field} is required`);
          }
        }

        const {
          id,
          ownerId,
          store_name,
          phone,
          address,
          gst,
          tax,
          city,
          location,
          pincode,
          currency,
          address_proof,
          type,
          branding,
          business_name,
          gst_number,
          vat,
          website,
          email,
        } = req.body;

        // ✅ Get existing store
        const existingItem = await StoreService.getById(id);
        if (!existingItem) {
          return sendResponse(resp, false, 404, "Store not found");
        }

        // ✅ Handle image update safely
        let imageUrl = existingItem.logo;

        if (req.file) {
          const oldImagePath = path.join("public", "uploads", "store", existingItem.logo || "");

          if (existingItem.logo && fs.existsSync(oldImagePath)) {
            try {
              await fs.promises.unlink(oldImagePath);
            } catch (unlinkErr) {
              console.error("Error deleting old image:", unlinkErr.message);
            }
          }

          imageUrl = req.file.filename;
        }

        // ✅ Prepare data for DB update
        const saveData = {
          ownerId,
          store_name,
          phone,
          address,
          gst,
          tax,
          city,
          location,
          pincode,
          currency: currency || null,
          address_proof: address_proof || null,
          type,
          branding: Array.isArray(branding) ? branding.join(",") : branding,
          business_name,
          gst_number,
          vat: vat || 0,
          logo: imageUrl,
          website: website || null,
          email,
        };

        // ✅ Perform update
        const result = await StoreService.update(id, saveData);
        if (!result) {
          return sendResponse(resp, false, 400, "Something went wrong while updating");
        }

        return sendResponse(resp, true, 200, "Store updated successfully");
      } catch (error) {
        console.error("Update Error:", error);
        return sendResponse(resp, false, 500, `Error: ${error.message}`);
      }
    });
  },

  deleteData: async (req, resp) => {
    try {
      const { id } = req.params;
      const result = await StoreService.deleteData(id);
      return sendResponse(resp, true, 200, "Store item deleted successful");
    } catch (error) {
      return sendResponse(resp, false, 500, `Error : ${error.message}`);
    }
  },
};
