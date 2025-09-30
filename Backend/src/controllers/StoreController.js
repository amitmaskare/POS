import { sendResponse } from "../utils/sendResponse.js";
import { StoreService } from "../services/StoreService.js";

export const StoreController = {
  list: async (req, resp) => {
    try {
      const result = await StoreService.list();

      if (!result || result.length === 0) {
        return sendResponse(resp, false, 400, "No Data Found");
      }
      let data = [];
      for (let item of result) {
        data.push({
          store_id: item.store_id,
          name: item.store_name,
          phone: item.phone,
          address: item.address,
          type: item.type,
        });
      }
      return sendResponse(resp, true, 200, "Fetch store data", data);
    } catch (error) {
      return sendResponse(resp, false, 500, `Error :${error.message}`);
    }
  },

  add: async (req, resp) => {
    try {
      if (!req.body) {
        return sendResponse(resp, false, 400, "store_name field is required");
      }
      const {
        store_name,
        phone,
        address,
        gst,
        tax,
        city,
        location,
        pincode,
        type,
      } = req.body;
      if (!store_name) {
        return sendResponse(resp, false, 400, "store_name field is required");
      }
      if (!phone) {
        return sendResponse(resp, false, 400, "phone field is required");
      }
      if (!address) {
        return sendResponse(resp, false, 400, "address field is required");
      }
      if (!gst) {
        return sendResponse(resp, false, 400, "gst field is required");
      }
      if (!tax) {
        return sendResponse(resp, false, 400, "tax field is required");
      }
      if (!city) {
        return sendResponse(resp, false, 400, "city field is required");
      }
      if (!location) {
        return sendResponse(resp, false, 400, "location field is required");
      }
      if (!pincode) {
        return sendResponse(resp, false, 400, "pincode field is required");
      }
      if (!type) {
        return sendResponse(resp, false, 400, "type field is required");
      }
      const result = await StoreService.add(req.body);

      return sendResponse(resp, true, 201, "Store added successful");
    } catch (error) {
      return sendResponse(resp, false, 500, `Error : ${error.message}`);
    }
  },
};
