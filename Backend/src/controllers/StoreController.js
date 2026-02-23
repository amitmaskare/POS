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

      // map logo to full URL when present
      const mapped = result.map((row) => ({
        ...row,
        logo: row.logo ? `${baseUrl}/public/uploads/store/${row.logo}` : null,
      }));

      return sendResponse(resp, true, 200, "Fetch store data", mapped);
    } catch (error) {
      return sendResponse(resp, false, 500, `Error :${error.message}`);
    }
  },

  add: async (req, resp) => {
  upload.single("logo")(req, resp, async (err) => {
    try {
      if (err) {
        return sendResponse(resp, false, 400, `Upload Error: ${err.message}`);
      }

      // ✅ Ensure body exists
      if (!req.body) {
        return sendResponse(resp, false, 400, "Request body missing");
      }

      const {
        store_name,
        phone,
        address,
        type,
        email,
        location
      } = req.body;

      // ✅ Required field validation
      const requiredFields = [
        "store_name",
        "phone",
        "address",
        "type",
        "email"
      ];

      for (let field of requiredFields) {
        const value = String(req.body[field] || "").trim();
        if (!value) {
          return sendResponse(resp, false, 400, `${field} is required`);
        }
      }

      // ✅ Get uploaded image name safely
      const imageUrl = req.file ? req.file.filename : null;
      
      // ✅ Generate next store ID
      const store_id = await StoreService.getNextStoreId();

      const saveData = {
        store_id,
        store_name: store_name.trim(),
        phone: phone,
        address: address.trim(),
        type: type.trim(),
        email: email.trim(),
        location: location ? location.trim() : null,
        logo: imageUrl
      };

      // ✅ Save to DB
      const result = await StoreService.add(saveData);

      if (!result) {
        return sendResponse(resp, false, 400, "Something went wrong");
      }

      return sendResponse(resp, true, 201, "Store added successfully");

    } catch (error) {
      console.error("Add Store Error:", error);
      return sendResponse(
        resp,
        false,
        500,
        error.message || "Something went wrong"
      );
    }
  });
},


  getById: async (req, resp) => {
    try {
      const { id } = req.params;
      const result = await StoreService.getById(id);
      const data = {
        ...result,
        logo: result && result.logo
          ? `${baseUrl}/public/uploads/store/${result.logo}`
          : null,
      };
      return sendResponse(resp, true, 200, "Fetch get by id", data);
    } catch (error) {
      return sendResponse(resp, false, 500, `Error : ${error.message}`);
    }
  },

 update: async (req, resp) => {
  upload.single("logo")(req, resp, async (err) => {
    try {

      // ✅ Handle upload error
      if (err) {
        return sendResponse(resp, false, 400, `Upload Error: ${err.message}`);
      }

      // ✅ Ensure body exists
      if (!req.body) {
        return sendResponse(resp, false, 400, "Request body missing");
      }

      const {
        id,
        store_name,
        phone,
        address,
        type,
        email,
        location
      } = req.body;

      // ✅ Required field validation
      const requiredFields = [
        "id",
        "store_name",
        "phone",
        "address",
        "type",
        "email"
      ];

      for (let field of requiredFields) {
        const value = String(req.body[field] || "").trim();
        if (!value) {
          return sendResponse(resp, false, 400, `${field} is required`);
        }
      }

      // ✅ Get existing store
      const existingItem = await StoreService.getById(id);

      if (!existingItem) {
        return sendResponse(resp, false, 404, "Store not found");
      }

      let imageUrl = existingItem.logo;

      // ✅ If new file uploaded
      if (req.file) {
        const oldImagePath = path.join(
          process.cwd(),
          "public",
          "uploads",
          "store",
          existingItem.logo || ""
        );

        // Delete old image safely
        if (existingItem.logo && fs.existsSync(oldImagePath)) {
          try {
            await fs.promises.unlink(oldImagePath);
          } catch (deleteErr) {
            console.error("Old image delete error:", deleteErr.message);
          }
        }

        imageUrl = req.file.filename;
      }

      // ✅ Prepare update data
      const saveData = {
        store_name,
        phone,
        address,
        type,
        email,
        location: location ? location.trim() : null,
        logo: imageUrl
      };

      // ✅ Update store
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
      const store = await StoreService.getById(id);
       if (!store) {
        return sendResponse(resp, false, 404, "Store not found");
      }
      const logoPath = path.join("public", "uploads", "store", store.logo);
      if (fs.existsSync(logoPath)) {
        try {
          await fs.promises.unlink(logoPath);
          console.log(`Logo file deleted: ${store.logo}`);
        } catch (unlinkErr) {
          console.error("Error deleting logo file:", unlinkErr.message);
        }
      }
      const result = await StoreService.deleteData(id);
      return sendResponse(resp, true, 200, "Store item deleted successful");
    } catch (error) {
      return sendResponse(resp, false, 500, `Error : ${error.message}`);
    }
  },
};
