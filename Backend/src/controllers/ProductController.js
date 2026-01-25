import { sendResponse } from "../utils/sendResponse.js";
import { ProductService } from "../services/ProductService.js";
import fs from "fs";
import dotenv from "dotenv";
import createuploadFile from "../utils/uploadFile.js";
import path from "path";
import { CommonModel } from "../models/CommonModel.js";
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
     const data = result.map(item => ({
      ...item,
      image: item.image
        ? `${baseUrl}/public/uploads/product/${item.image}`
        : null
    }));
      return sendResponse(resp, true, 200, "Fetch store data", data);
    } catch (error) {
      return sendResponse(resp, false, 500, `Error :${error.message}`);
    }
  },

  add: async (req, resp) => {
   try{
      const requiredFields = [
        "product_name",
        "sku",
        "barcode",
        "brand",
        "category_id",
        "favourite",
        "description",
        "cost_price",
        "selling_price",
        "tax_rate",
        "supplier_id",
      ];
      
      for (let field of requiredFields) {
        if (req.body[field] === undefined) {
          return sendResponse(resp, false, 400, `${field} is required`);
        }
      }
      const stockFields = [
        "initial_stock"
      ];
      if (req.body.initial_stock === undefined) {
        return sendResponse(resp, false, 400, "initial_stock is required");
      }
        const result = await ProductService.add(req.body);
        if (!result) {
          return sendResponse(resp, false, 400, "Something went wrong");
        }

        await CommonModel.insertData({
          table: "stocks",
         data: {
            product_id: result,
            stock: req.body.initial_stock,
            type:'credit',
            note:'Add Product',
            created_at:new Date(),
          }
        });
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
        "id","product_name","sku","category_id","favourite","barcode",
        "brand","description","cost_price","selling_price","tax_rate","supplier_id",
      ];
  
      for (let field of requiredFields) {
        if (req.body[field] === undefined || req.body[field] === null) {
          return sendResponse(resp, false, 400, `${field} is required`);
        }
      }      
          const result = await ProductService.update(req.body);
          if (!result || result.affectedRows === 0) {
            return sendResponse(resp, false, 400, "Product update failed");
          }
          return sendResponse(resp, true, 201, "Product updated successful");
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
      const item = result[0];
      const data ={
        id: item.id,
        product_name: item.product_name,
        qty: 1,
        selling_price: item.selling_price,
        price: item.selling_price,
        image: item.image
        ? `${baseUrl}/public/uploads/product/${item.image}`
        : null,
        min_qty:item.min_qty,
        offer_price:item.offer_price,
        offer_qty_price:item.offer_qty_price,
        tax:item.tax_rate,
      }
      return sendResponse(resp,true,200,"Fetch Data Successful",data)
    }catch(error)
    {
      return sendResponse(resp,false,500,`Error : ${error.message}`)
    }
  },

  categoryWiseSubcategoryData:async(req,resp)=>{
    try{
      const categoryId = req.params.categoryId;
      
      if(!categoryId)
      {
      return sendResponse(resp,false,400,`category id not found`)
      }
      const result=await ProductService.categoryWiseSubcategoryData(categoryId)
      if(!result || result.length===0)
      {
        return sendResponse(resp,false,400,"No Data Found")
      }
      return sendResponse(resp,true,200,"Fetch Data Successful",result)
    }catch(error)
    {
      return sendResponse(resp,false,500,`Error : ${error.message}`)
    }
  },

  addProduct: async (req, resp) => {
    try{
       const requiredFields = [
         "barcode",
         "product_name",
         "selling_price",
       ];
       for (let field of requiredFields) {
         if (!req.body[field]) {
           return sendResponse(resp, false, 400, `${field} is required`);
         }
       }
       const {barcode,product_name,selling_price}=req.body
         const result = await ProductService.add(req.body);
         const getImage=await CommonModel.getSingle({table:"products",fields:['id,image'],conditions:{id:result}})
         if (!result) {
           return sendResponse(resp, false, 400, "Something went wrong");
         }

         const data={
           id:result,
           barcode,
           product_name,
           price:selling_price,
           qty:1,
           tax:0,
           image: getImage.image
           ? `${baseUrl}/public/uploads/product/${getImage.image}`
           : null,
           //min_qty:item.min_qty,
           //offer_price:item.offer_price,
         }
 
         return sendResponse(resp, true, 201, "Product added successful",data);
       } catch (error) {
         return sendResponse(
           resp,
           false,
           500,
           error.message || "Something wennt Wrong"
         );
       }
   },

   favouriteList: async (req, resp) => {
    try {
      const result = await ProductService.favouriteList();
    
      if (!result || result.length === 0) {
        return sendResponse(resp, false, 400, "No Data Found");
      }
     const data = result.map(item => ({
      ...item,
      qty:1,
      selling_price: item.selling_price,
      price:item.selling_price,
      image: item.image
        ? `${baseUrl}/public/uploads/product/${item.image}`
        : null,
        min_qty:item.min_qty,
        offer_price:item.offer_price,
        tax:item.tax_rate,
    }));
      return sendResponse(resp, true, 200, "Fetch store data", data);
    } catch (error) {
      return sendResponse(resp, false, 500, `Error :${error.message}`);
    }
  },

  looseItemList: async (req, resp) => {
    try {
      const result = await ProductService.looseItemList();
    
      if (!result || result.length === 0) {
        return sendResponse(resp, false, 400, "No Data Found");
      }
     const data = result.map(item => ({
      ...item,
      qty:1,
      selling_price: item.selling_price,
      price:item.selling_price,
      image: item.image
        ? `${baseUrl}/public/uploads/product/${item.image}`
        : null,
        min_qty:item.min_qty,
        offer_price:item.offer_price,
        tax:item.tax_rate,

    }));
      return sendResponse(resp, true, 200, "Fetch store data", data);
    } catch (error) {
      return sendResponse(resp, false, 500, `Error :${error.message}`);
    }
  },

  inventoryList: async (req, resp) => {
    try {
      const result = await ProductService.inventoryList();
    
      if (!result || result.length === 0) {
        return sendResponse(resp, false, 400, "No Data Found");
      }
     const data = result.map(item => ({
      ...item,
      image: item.image
        ? `${baseUrl}/public/uploads/product/${item.image}`
        : null
    }));
      return sendResponse(resp, true, 200, "Fetch store data", data);
    } catch (error) {
      return sendResponse(resp, false, 500, `Error :${error.message}`);
    }
  },

  addStock:async(req,resp)=>{
    try{
      const{stock,product_id}=req.body
      if(!product_id)
      {
          return sendResponse(resp,false,400,"product_id field is required")
      }
      if(!stock)
      {
          return sendResponse(resp,false,400,"stock field is required")
      }
       const result= await CommonModel.insertData({
          table: "stocks",
         data: {
            product_id: product_id,
            stock: stock,
            type:'credit',
            note:'Add Product',
          }
        });
        return sendResponse(resp, true, 201, "Stock added successful");
      } catch (error) {
        return sendResponse(
          resp,
          false,
          500,
          error.message || "Something wennt Wrong"
        );
      }
  }

};
