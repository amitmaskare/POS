import { sendResponse } from "../utils/sendResponse.js";
import { ProductService } from "../services/ProductService.js";
import fs from "fs";
import dotenv from "dotenv";
import createuploadFile from "../utils/uploadFile.js";
import path from "path";
dotenv.config();
const upload = createuploadFile("store");
const baseUrl = process.env.BASE_URL;

export const ProductController = {
    
  list: async (req, resp) => {
    try {
      const result = await ProductService.list();

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
        "product_name",
        "sku",
        "category_id",
        "subcategory_id",
        "cost_price",
        "unit_price",
        "selling_price",
        "initial_stock",
        "reorder_level",
        "unit",
        "package_id",
        "unit_per_package",
        "supplier_id",
      ];
      for (let field of requiredFields) {
        if (!req.body[field]) {
          return sendResponse(resp, false, 400, `${field} is required`);
        }
      }

        const result = await ProductService.add(req.body);
        if (!result) {
          return sendResponse(resp, false, 400, "Something went wrong");
        }

        return sendResponse(resp, true, 201, "Product added successful");
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
      const result = await ProductService.getById(id);
      return sendResponse(resp, true, 200, "Fetch get by id", result);
    } catch (error) {
      return sendResponse(resp, false, 500, `Error : ${error.message}`);
    }
  },

  update: async (req, resp) => {
    try{
        const requiredFields = [
          "product_name",
          "sku",
          "category_id",
          "subcategory_id",
          "cost_price",
          "unit_price",
          "selling_price",
          "initial_stock",
          "reorder_level",
          "unit",
          "package_id",
          "unit_per_package",
          "supplier_id",
        ];
        for (let field of requiredFields) {
          if (!req.body[field]) {
            return sendResponse(resp, false, 400, `${field} is required`);
          }
        }
  
          const result = await ProductService.add(req.body);
          if (!result) {
            return sendResponse(resp, false, 400, "Something went wrong");
          }
  
          return sendResponse(resp, true, 201, "Product added successful");
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
      const result = await ProductService.deleteData(id);
      return sendResponse(resp, true, 200, "Product item deleted successful");
    } catch (error) {
      return sendResponse(resp, false, 500, `Error : ${error.message}`);
    }
  },

  searchProduct:async(req,resp)=>{
    try{
      const {search}=req.body
      if(!search)
      {
        return sendResponse(resp,false,400,"search field is required")
      }
      const result=await ProductService.searchProduct(search)
     
      if(!result || result.length===0)
      {
        return sendResponse(resp,false,400,"No Data Found")
      }
      return sendResponse(resp,true,200,"Fetch Data Successful",result)
    }catch(error)
    {
      return sendResponse(resp,false,500,`Error : ${error.message}`)
    }
  }


};
