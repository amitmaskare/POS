import { sendResponse } from "../utils/sendResponse.js";
import { PurchaseService } from "../services/PurchaseService.js";
import { getStoreIdFromRequest } from "../utils/storeHelper.js";

import dotenv from "dotenv";
import { CommonModel } from "../models/CommonModel.js";

dotenv.config();

const baseUrl = process.env.BASE_URL;

export const PurchaseController = {
    
  list: async (req, resp) => {
    try {
      const storeId = getStoreIdFromRequest(req);
      const result = await PurchaseService.list(storeId);

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
        const storeId = getStoreIdFromRequest(req);
        const requiredFields = [
          "supplier_id",
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
          type,
          items
        } = req.body;
    
        if (!Array.isArray(items) || items.length === 0) {
          return sendResponse(resp, false, 400, "Items cannot be empty");
        }

        // Validate all items have required fields
        for (const item of items) {
          if (!item.product_id || !item.quantity || item.quantity <= 0) {
            return sendResponse(resp, false, 400, "Each item must have product_id and quantity > 0");
          }
          if (item.cost_price === undefined || item.cost_price < 0) {
            return sendResponse(resp, false, 400, "Each item must have a valid cost_price");
          }
        }

        // Calculate totals from items
        let subtotal = 0;
        let totalTax = 0;

        for (const item of items) {
          const itemSubtotal = item.quantity * item.cost_price;
          const itemTax = item.tax ? (itemSubtotal * item.tax) / 100 : 0;
          subtotal += itemSubtotal;
          totalTax += itemTax;
        }

        const grand_total = subtotal + totalTax;

        // Generate PO number
        const po_number = await PurchaseService.getNextPurchaseId(type, storeId);
        const user_id  = req.user.userId;
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const purchase_date = `${year}-${month}-${day}`;

        const purchaseData = {
          po_number: po_number,
          userId: user_id,
          supplier_id,
          purchase_date,
          subtotal: parseFloat(subtotal.toFixed(2)),
          tax: parseFloat(totalTax.toFixed(2)),
          grand_total: parseFloat(grand_total.toFixed(2)),
          type,
          status: 'pending'
        };

        const result = await PurchaseService.add(purchaseData, storeId);
         
        if (!result) {
          return sendResponse(resp, false, 400, "Something went wrong");
        }

        const purchase_id = result;

        // Add all purchase items
        for (const item of items) {
          const itemData = {
            purchase_id,
            po_number,
            product_id: item.product_id,
            quantity: item.quantity,
            cost_price: item.cost_price,
            received_qty: 0
          };
          await PurchaseService.addItem(itemData);
        }

        return sendResponse(resp, true, 201, "Purchase added successfully", { po_number, purchase_id: result });
      } catch (error) {
        return sendResponse(
          resp,
          false,
          500,
          error.message || "Something went wrong"
        );
      }
  },

 
  generateNextPONumber:async(req,resp)=>{
    try {
      const storeId = getStoreIdFromRequest(req);
      const poNumber  = await PurchaseService.getNextPurchaseId(null, storeId);
      return sendResponse(resp, true, 200, "Generate next PO number successful",poNumber);
    } catch (error) {
      return sendResponse(resp, false, 500, `Error : ${error.message}`);
    }
  },
  
  
  
  getById: async (req, resp) => {
    try {
      const storeId = getStoreIdFromRequest(req);
      const { id } = req.params;
      const result = await PurchaseService.getById(id, storeId)
      //const result = await PurchaseService.getById(id);
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
      const storeId = getStoreIdFromRequest(req);
      const requiredFields = ["id", "supplier_id", "type", "items"];
  
      for (let field of requiredFields) {
        if (!req.body[field]) {
          return sendResponse(resp, false, 400, `${field} is required`);
        }
      }
  
      const { id, supplier_id, type, items } = req.body;
  
      if (!Array.isArray(items) || items.length === 0) {
        return sendResponse(resp, false, 400, "Items cannot be empty");
      }

      // Validate all items
      for (const item of items) {
        if (!item.product_id || !item.quantity || item.quantity <= 0) {
          return sendResponse(resp, false, 400, "Each item must have product_id and quantity > 0");
        }
        if (item.cost_price === undefined || item.cost_price < 0) {
          return sendResponse(resp, false, 400, "Each item must have a valid cost_price");
        }
      }
  
      // STEP 1: Get existing purchase
      const existingPO = await CommonModel.getSingle({
        table: "purchases",
        fields: ["id", "po_number", "type", "purchase_date"],
        conditions: { id },
        storeId
      });
  
      if (!existingPO) {
        return sendResponse(resp, false, 404, "Purchase not found");
      }
  
      let newPoNumber = existingPO.po_number;
      let purchase_date = existingPO.purchase_date;

      // STEP 2: Generate NEW PO number IF type changes from draft → send
      if (existingPO.type === "draft" && type === "send") {
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, "0");
        const d = String(today.getDate()).padStart(2, "0");
        const lastSeq = existingPO.po_number.slice(-4); // Extract sequence
        newPoNumber = `PO${y}${m}${d}${lastSeq}`;
        purchase_date = `${y}-${m}-${d}`;
      }

      // STEP 3: Calculate totals from items
      let subtotal = 0;
      let totalTax = 0;

      for (const item of items) {
        const itemSubtotal = item.quantity * item.cost_price;
        const itemTax = item.tax ? (itemSubtotal * item.tax) / 100 : 0;
        subtotal += itemSubtotal;
        totalTax += itemTax;
      }

      const grand_total = subtotal + totalTax;

      // STEP 4: Update purchase
      const purchaseData = {
        id,
        supplier_id,
        purchase_date,
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(totalTax.toFixed(2)),
        grand_total: parseFloat(grand_total.toFixed(2)),
        type,
        po_number: newPoNumber,
        status: 'pending'
      };
  
      await PurchaseService.update(purchaseData, storeId);

      // STEP 5: Get existing items from database
      const dbItems = await CommonModel.getAllData({
        table: "purchase_order_items",
        conditions: { purchase_id: id }
      });

      const dbItemMap = new Map(dbItems.map(i => [i.id, i]));
      const requestItemIds = items.filter(i => i.id).map(i => i.id);

      // STEP 6: Process items (update/insert)
      for (const item of items) {
        if (item.id && dbItemMap.has(item.id)) {
          // Update existing item
          await CommonModel.updateData({
            table: "purchase_order_items",
            data: {
              po_number: newPoNumber,
              product_id: item.product_id,
              quantity: item.quantity,
              cost_price: item.cost_price
            },
            conditions: { id: item.id }
          });
        } else {
          // Insert new item
          await CommonModel.insertData({
            table: "purchase_order_items",
            data: {
              purchase_id: id,
              po_number: newPoNumber,
              product_id: item.product_id,
              quantity: item.quantity,
              cost_price: item.cost_price,
              received_qty: 0
            }
          });
        }
      }

      // STEP 7: Delete removed items
      for (const dbItem of dbItems) {
        if (!requestItemIds.includes(dbItem.id)) {
          await CommonModel.deleteData({
            table: "purchase_order_items",
            conditions: { id: dbItem.id }
          });
        }
      }
  
      return sendResponse(resp, true, 200, "Purchase updated successfully", {
        po_number: newPoNumber
      });
  
    } catch (error) {
      return sendResponse(resp, false, 500, error.message || "Something went wrong");
    }
  },


  receiveItems: async (req, resp) => {
    try {
      const storeId = getStoreIdFromRequest(req);
      const result = await PurchaseService.receiveItems(storeId);

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
      const storeId = getStoreIdFromRequest(req);
      const { po_number, items } = req.body;
  
      if (!po_number || !Array.isArray(items) || items.length === 0) {
        return sendResponse(resp, false, 400, "po_number & items with receive_qty required");
      }
  
      // Get purchase order
      const poData = await CommonModel.getSingle({
        table: "purchases",
        conditions: { po_number },
        storeId
      });
  
      if (!poData) {
        return sendResponse(resp, false, 404, "Invalid PO number");
      }

      // Filter items with receive_qty > 0
      const itemsToReceive = items.filter(i => i.receive_qty && i.receive_qty > 0);

      if (itemsToReceive.length === 0) {
        return sendResponse(resp, false, 400, "No items to receive");
      }

      let hasError = false;
      let errorMsg = "";
      let allCompleted = true;
  
      for (const item of itemsToReceive) {
        const { product_id, receive_qty, received_reason } = item;
  
        if (!product_id || !receive_qty || receive_qty <= 0) {
          continue;
        }
  
        // Fetch existing PO item
        const poItem = await CommonModel.getSingle({
          table: "purchase_order_items",
          conditions: { po_number, product_id }
        });
  
        if (!poItem) {
          hasError = true;
          errorMsg = `Product ${product_id} not found in this PO`;
          continue;
        }

        const orderedQty = poItem.quantity;
        const currentReceivedQty = poItem.received_qty || 0;
        const newReceivedQty = currentReceivedQty + receive_qty;

        // Validate received quantity doesn't exceed ordered
        if (newReceivedQty > orderedQty) {
          hasError = true;
          errorMsg = `Cannot receive ${receive_qty} units of product ${product_id}. Only ${orderedQty - currentReceivedQty} units pending.`;
          continue;
        }

        // Update received quantity
        await CommonModel.updateData({
          table: "purchase_order_items",
          data: {
            received_qty: newReceivedQty,
            received_reason: received_reason || null
          },
          conditions: { id: poItem.id }
        });

        // Add to stock
        await CommonModel.insertData({
          table: "stocks",
          data: {
            product_id,
            stock: receive_qty,
            type: "credit",
            note: `Purchase Receiving - ${po_number}`,
            store_id: storeId,
            created_at: new Date()
          }
        });

        // Check if all items received for this product
        if (newReceivedQty < orderedQty) {
          allCompleted = false;
        }
      }

      if (hasError) {
        return sendResponse(resp, false, 400, errorMsg);
      }

      // Update purchase status
      const status = allCompleted ? "completed" : "partial";
      await CommonModel.updateData({
        table: "purchases",
        data: { status },
        conditions: { po_number },
        storeId
      });
  
      return sendResponse(resp, true, 200, 
        allCompleted ? "All items received successfully" : "Items partially received",
        { po_number, status, received_items: itemsToReceive.length }
      );
  
    } catch (error) {
      return sendResponse(resp, false, 500, error.message);
    }
  },
  
   

};
