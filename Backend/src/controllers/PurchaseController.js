import { sendResponse } from "../utils/sendResponse.js";
import { PurchaseService } from "../services/PurchaseService.js";

import dotenv from "dotenv";
import { CommonModel } from "../models/CommonModel.js";

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
      try {
        const requiredFields = [
          "supplier_id",
          "subtotal",
          "tax",
          "grand_total",
          "type", 
          "items"
        ];
    
        for (let field of requiredFields) {
          if (!req.body[field]) {
            return sendResponse(resp, false, 400, `${field} is required`);
          }
        }
    
        const {
          supplier_id,
          subtotal,
          tax,
          type,
          grand_total,
          items
        } = req.body;
    
        if (!Array.isArray(items) || items.length === 0) {
          return sendResponse(resp, false, 400, "Items cannot be empty");
        }
    
        const po_number = await PurchaseService.getNextPurchaseId(type);
        //resp.send(po_number); return false;
       const user_id  = req.user.userId;
       const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0");
const day = String(now.getDate()).padStart(2, "0");
const purchase_date = `${year}-${month}-${day}`;
              const purchaseData  = {
                po_number: po_number,
                userId:user_id,
                supplier_id,
      purchase_date:purchase_date,
      subtotal,
      tax,
      grand_total,
      type,
              };
        const result = await PurchaseService.add(purchaseData);
         
        if (!result) {
          return sendResponse(resp, false, 400, "Something went wrong");
        }
        const id=result
        const getPoNumber= await CommonModel.getSingle({table:'purchases',fields:['po_number'],conditions:{id}})

        for (const item of items) {
          const itemData = {
            purchase_id:id,
            po_number:getPoNumber.po_number,
            product_id: item.product_id,
            quantity: item.quantity,
            cost_price: item.cost_price,
            product_name: item.product_name || '', // ✅ NEW
            tax: item.tax || 0,               // ✅ NEW
            image: item.image || null 
          };
          await PurchaseService.addItem(itemData);
    }
        return sendResponse(resp, true, 201, "Purchase added successful",po_number);
      } catch (error) {
        return sendResponse(
          resp,
          false,
          500,
          error.message || "Something wennt Wrong"
        );
      }
  },

 
  generateNextPONumber:async(req,resp)=>{
    try {
      const poNumber  = await PurchaseService.getNextPurchaseId();
      return sendResponse(resp, true, 200, "Generate next PO number successful",poNumber);
    } catch (error) {
      return sendResponse(resp, false, 500, `Error : ${error.message}`);
    }
  },
  
  
  
  getById: async (req, resp) => {
    try {
      const { id } = req.params;
      const result = await PurchaseService.getById(id);
      const purchaseItem=await CommonModel.getAllData({table:"purchase_order_items",conditions:{po_number:result.po_number}})
      const data={
        purchase:result,
        purchaseItem
      }
      return sendResponse(resp, true, 200, "Fetch get by id", data);
    } catch (error) {
      return sendResponse(resp, false, 500, `Error : ${error.message}`);
    }
  },

  update: async (req, resp) => {
    try {
      const requiredFields = [
        "id",
        "supplier_id",
        "subtotal",
        "tax",
        "grand_total",
        "type",
        "items"
      ];
  
      for (let field of requiredFields) {
        if (!req.body[field]) {
          return sendResponse(resp, false, 400, `${field} is required`);
        }
      }
  
      const { id, supplier_id, subtotal, tax, type, grand_total, items } = req.body;
  
      if (!Array.isArray(items) || items.length === 0) {
        return sendResponse(resp, false, 400, "Items cannot be empty");
      }
  
      // STEP 1: Get existing PO
      const existingPO = await CommonModel.getSingle({
        table: "purchases",
        fields: ["po_number", "type","purchase_date"],
        conditions: { id }
      });
  
      if (!existingPO) {
        return sendResponse(resp, false, 404, "Purchase not found");
      }
  
      const oldPoNumber = existingPO.po_number;
  
      // Extract last sequence (0003)
      const lastSequence = oldPoNumber.split("-").pop();  // "0003"
  
      // STEP 2: Generate NEW PO number IF type changes from draft → send
      let newPoNumber = oldPoNumber;
      let purchase_date=existingPO.purchase_date
      if (existingPO.type === "draft" && type === "send") {
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, "0");
        const d = String(today.getDate()).padStart(2, "0");
        newPoNumber = `PO-${d}-${m}-${y}-${lastSequence}`;
        purchase_date = `${y}-${m}-${d}`;
      }
  
      // STEP 3: Update purchase data
      const purchaseData = {
        id,
       purchase_date:purchase_date,
        supplier_id,
        subtotal,
        tax,
        grand_total,
        type,
        po_number: newPoNumber,
        status: 'pending',  
      };
  
      await PurchaseService.update(purchaseData);
      const dbItems = await CommonModel.getAllData({
        table: "purchase_order_items",
        fields: ["id"],
        conditions: { purchase_id: id }
      });
      const dbItemIds = dbItems.map(i => i.id);
      const requestItemIds = items.filter(i => i.id).map(i => i.id);
      for (const item of items) {
       
        if (item.id) {
          await CommonModel.updateData({
            table: "purchase_order_items",
            data: {
              po_number: newPoNumber,
              product_id: item.product_id,
              quantity: item.quantity,
              cost_price: item.cost_price,
              product_name: item.product_name || "",
              tax: item.tax || 0,
              image: item.image || null,
              received_qty: item.received_qty || 0,
              received_reason: item.received_reason || null
            },
            conditions: { id: item.id }
          });
        }
        else {
          await CommonModel.insertData({
            table: "purchase_order_items",
            data: {
              purchase_id: id,
              po_number: newPoNumber,
              product_id: item.product_id,
              quantity: item.quantity,
              cost_price: item.cost_price,
              product_name: item.product_name || "",
              tax: item.tax || 0,
              image: item.image || null,
              received_qty: 0,
              created_at: new Date()
            }
          });
        }
      
      }
      if (type === "draft" || type === "send") {
        const deletedIds = dbItemIds.filter(
          id => !requestItemIds.includes(id)
        );
  
        if (deletedIds.length > 0) {
          await CommonModel.deleteData({
            table: "purchase_order_items",
            conditions: { id: deletedIds }
          });
        }
      }
  
      return sendResponse(resp, true, 200, "Purchase updated successfully", {
        po_number: newPoNumber
      });
  
    } catch (error) {
      return sendResponse(
        resp,
        false,
        500,
        error.message || "Something went wrong"
      );
    }
  },


  receiveItems:async(req,resp)=>{
    try {
      const result = await PurchaseService.receiveItems();

      if (!result || result.length === 0) {
        return sendResponse(resp, false, 400, "No Data Found");
      }
      return sendResponse(resp, true, 200, "Fetch store data", result);
    } catch (error) {
      return sendResponse(resp, false, 500, `Error :${error.message}`);
    }
  },

  receiveQuantity: async (req, resp) => {
    try {
      const { po_number, items } = req.body;
  
      if (!po_number || !Array.isArray(items) || items.length === 0) {
        return sendResponse(resp, false, 400, "po_number & items required");
      }
  
      const poData = await CommonModel.getSingle({
        table: "purchases",
        fields: ["id", "status"],
        conditions: { po_number }
      });
  
  
      if (!poData) {
        return sendResponse(resp, false, 404, "Invalid PO number");
      }
  
      let allCompleted = true;
  
      for (const item of items) {
        const { product_id, receive_qty,received_reason = null } = item;
  
        if (!product_id || !receive_qty || receive_qty <= 0) {
          continue;
        }
  
        // fetch existing PO item details
        const poItem = await CommonModel.getSingle({
          table: "purchase_order_items",
          conditions: { po_number, product_id }
        });
  
        if (!poItem) continue;
        const orderedQty = poItem.quantity; // 🔥 ordered qty
        const newReceivedQty = poItem.received_qty + receive_qty;
        await CommonModel.updateData({
          table: "purchase_order_items",
          data: {
            received_qty: newReceivedQty,
            received_reason
          },
          conditions: { id: poItem.id }
        });

  
        // update stock
        await CommonModel.insertData({
          table: "stocks",
          data: {
            product_id,
            stock: receive_qty,
            type: "credit",
            note: "Purchase Receiving",
            created_at: new Date()
          }
        });
  
        if (newReceivedQty < orderedQty) {
          allCompleted = false;
        }
      }
  
      await CommonModel.updateData({
        table: "purchases",
        data: {
          status: allCompleted ? "complete" : "partial"
        },
        conditions: { po_number }
      });
  
      return sendResponse(
        resp,
        true,
        200,
        allCompleted
          ? "All items fully received"
          : "Items partially received",
        po_number
      );
  
    } catch (error) {
      return sendResponse(resp, false, 500, error.message);
    }
  },
  
   

};
