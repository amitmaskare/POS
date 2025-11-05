import { sendResponse } from "../utils/sendResponse.js";
import { PurchaseService } from "../services/PurchaseService.js";

import dotenv from "dotenv";

dotenv.config();

const baseUrl = process.env.BASE_URL;

export const PurchaseController = {
    
  list: async (req, resp) => {
    try {
      const result = await PurchaseService.list();

      if (!result || result.length === 0) {
        return sendResponse(resp, false, 400, "No Data Found");
      }
      return sendResponse(resp, true, 200, "Fetch store data", result);
    } catch (error) {
      return sendResponse(resp, false, 500, `Error :${error.message}`);
    }
  },

  add: async (req, resp) => {
   try{
      const requiredFields = [
        "date",
        "supplier_id",
        "item",
        "quantity",
      ];
      for (let field of requiredFields) {
        if (!req.body[field]) {
          return sendResponse(resp, false, 400, `${field} is required`);
        }
      }
       const po_number = await StoreService.getNextPurchaseId();
       const login_user=req.user.userId;
              const saveData = {
                po_number: po_number,
                place_by_login_user:login_user,
                date: new Date(),
                supplier_id: supplier_id,
                item: item,
                quantity: quantity,
                amount: amount,
                tax: tax,
                created_at: new Date(),
              };
        const result = await PurchaseService.add(saveData);
        if (!result) {
          return sendResponse(resp, false, 400, "Something went wrong");
        }

        return sendResponse(resp, true, 201, "Purchase added successful");
      } catch (error) {
        return sendResponse(
          resp,
          false,
          500,
          error.message || "Something wennt Wrong"
        );
      }
  },

  getById: async (req, resp) => {
    try {
      const { id } = req.params;
      const result = await PurchaseService.getById(id);
      return sendResponse(resp, true, 200, "Fetch get by id", result);
    } catch (error) {
      return sendResponse(resp, false, 500, `Error : ${error.message}`);
    }
  },

  update: async (req, resp) => {
    try{
       const requiredFields = [
        "id",
        "date",
        "supplier_id",
        "item",
        "quantity",
      ];
      for (let field of requiredFields) {
        if (!req.body[field]) {
          return sendResponse(resp, false, 400, `${field} is required`);
        }
      }
      const{id}=req.body
              const saveData = {
                date: new Date(),
                supplier_id: supplier_id,
                item: item,
                quantity: quantity,
                amount: amount,
                tax: tax,   
              };
          const result = await PurchaseService.update(id,saveData);
          if (!result) {
            return sendResponse(resp, false, 400, "Something went wrong");
          }
  
          return sendResponse(resp, true, 201, "Purchase added successful");
        } catch (error) {
          return sendResponse(
            resp,
            false,
            500,
            error.message || "Something wennt Wrong"
          );
        }
  },

  deleteData: async (req, resp) => {
    try {
      const { id } = req.params;
      const result = await PurchaseService.deleteData(id);
      return sendResponse(resp, true, 200, "Purchase item deleted successful");
    } catch (error) {
      return sendResponse(resp, false, 500, `Error : ${error.message}`);
    }
  },


  




};
