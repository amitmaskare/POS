import { sendResponse } from "../utils/sendResponse.js";
import { ProductService } from "../services/ProductService.js";
import { getStoreIdFromRequest } from "../utils/storeHelper.js";
import fs from "fs";
import dotenv from "dotenv";
import createuploadFile from "../utils/uploadFile.js";
import path from "path";
import { CommonModel } from "../models/CommonModel.js";
dotenv.config();
const upload = createuploadFile("product");
const baseUrl = process.env.BASE_URL;

export const ProductController = {
    
  list: async (req, resp) => {
    try {
      const storeId = getStoreIdFromRequest(req);
      const result = await ProductService.list(storeId);

      if (!result || result.length === 0) {
        return sendResponse(resp, true, 200, "No products found", []);
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
    upload.single("image")(req, resp, async (err) => {
      if (err) {
        return sendResponse(resp, false, 400, `Upload Error: ${err.message}`);
      }
      const requiredFields = [
        "product_name",
        "sku",
        "category_id",
        "favourite",
        "cost_price",
        "selling_price",
        "tax_rate",
      ];

      for (let field of requiredFields) {
        if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
          return sendResponse(resp, false, 400, `${field} is required`);
        }
      }
   try{
      const storeId = getStoreIdFromRequest(req);
      if (req.body.initial_stock === undefined || req.body.initial_stock === null || req.body.initial_stock === '') {
        return sendResponse(resp, false, 400, "initial_stock is required");
      }
      const imageUrl = req.file ? req.file.filename : null;
      // Set defaults for optional numeric fields to avoid empty string DB errors
      if (!req.body.supplier_id) req.body.supplier_id = 0;
      if (!req.body.barcode) req.body.barcode = '';
      if (!req.body.brand) req.body.brand = '';
      if (!req.body.description) req.body.description = '';
      // Auto-set is_loose when favourite is 'loose'
      if (req.body.favourite === 'loose') {
        req.body.is_loose = 1;
        if (!req.body.price_per_unit) req.body.price_per_unit = req.body.selling_price;
      }
      const payLoad={
        ...req.body,
        image: imageUrl,
        store_id: storeId
      }
      const result = await ProductService.add(payLoad, storeId);
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
    });
  },

  getById: async (req, resp) => {
    try {
      const { id } = req.params;
      const storeId = getStoreIdFromRequest(req);
      const result = await ProductService.getById(id, storeId);
      if (!result) {
        return sendResponse(resp, false, 404, "Product not found");
      }
      const data = {
        ...result,
        image: result && result.image
          ? `${baseUrl}/public/uploads/product/${result.image}`
          : null,
      };
      return sendResponse(resp, true, 200, "Fetch get by id", data);
    } catch (error) {
      return sendResponse(resp, false, 500, `Error : ${error.message}`);
    }
  },

  update: async (req, resp) => {
    upload.single("image")(req, resp, async (err) => {
    try{
      const storeId = getStoreIdFromRequest(req);
      if (err) {
        return sendResponse(resp, false, 400, `Upload Error: ${err.message}`);
      }

      const {
        id,
        product_name,
        sku,
        category_id,
        favourite,
        barcode,
        brand,
        description,
        cost_price,
        selling_price,
        tax_rate,
        supplier_id,
      } = req.body;
      const requiredFields = [
        "id","product_name","sku","category_id","favourite","barcode",
        "brand","description","cost_price","selling_price","tax_rate","supplier_id",
      ];
  
      for (let field of requiredFields) {
        if (req.body[field] === undefined || req.body[field] === null) {
          return sendResponse(resp, false, 400, `${field} is required`);
        }
      }  
      const existingItem = await ProductService.getById(id, storeId);
      if (!existingItem) {
        return sendResponse(resp, false, 404, "Product not found");
      }

      // ✅ Handle image update safely
      let imageUrl = existingItem.image;  
      if (req.file) {
        const oldImagePath = path.join("public", "uploads", "product", existingItem.image || "");
        if (existingItem.image && fs.existsSync(oldImagePath)) {
          try {
            await fs.promises.unlink(oldImagePath);
          } catch (unlinkErr) {
            console.error("Error deleting old image:", unlinkErr.message);
          }
        }

        imageUrl = req.file.filename;
      }  
      const payLoad={
        ...req.body,
        image:imageUrl,
        store_id: storeId
      }
          const result = await ProductService.update(payLoad, storeId);
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
      });
  },

  deleteData: async (req, resp) => {
    try {
      const { id } = req.params;
      const storeId = getStoreIdFromRequest(req);
      const result = await ProductService.deleteData(id, storeId);
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
        const storeId = getStoreIdFromRequest(req);

      // Check if this is a weighted barcode (starts with "2", length 13)
      if (search.length === 13 && search.startsWith("20")) {
        const decoded = ProductService.decodeLooseBarcode(search);
        if (decoded) {
          const productResult = await ProductService.findByLooseProductCode(decoded.productCode, storeId);
          if (productResult && productResult.length > 0) {
            const item = productResult[0];
            const pricePerUnit = item.price_per_unit || item.selling_price;
            const calculatedPrice = parseFloat((decoded.weightInKg * pricePerUnit).toFixed(2));

            const data = {
              id: item.id,
              product_name: item.product_name,
              qty: decoded.weightInKg,
              selling_price: pricePerUnit,
              price: calculatedPrice,
              image: item.image ? `${baseUrl}/public/uploads/product/${item.image}` : null,
              min_qty: item.min_qty,
              offer_price: item.offer_price,
              offer_qty_price: item.offer_qty_price,
              tax: item.tax_rate,
              is_loose: 1,
              price_per_unit: pricePerUnit,
              loose_unit: item.loose_unit || 'kg',
              loose_weight: decoded.weightInKg,
              weighted_barcode: search,
            };
            return sendResponse(resp, true, 200, "Loose item found", data);
          }
        }
      }

      const result=await ProductService.searchProduct(search, storeId)

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
        favourite: item.favourite,
        is_loose: (item.is_loose === 1 || item.favourite === 'loose') ? 1 : 0,
        price_per_unit: item.price_per_unit || item.selling_price,
        loose_unit: item.loose_unit || 'kg',
      }
      return sendResponse(resp,true,200,"Fetch Data Successful",data)
    }catch(error)
    {
      return sendResponse(resp,false,500,`Error : ${error.message}`)
    }
  },

  searchProductList:async(req,resp)=>{
    try{
      const {search}=req.body
      if(!search)
      {
        return sendResponse(resp,false,400,"search field is required")
      }
      const storeId = getStoreIdFromRequest(req);

      // Check if this is a weighted barcode (starts with "2", length 13)
      if (search.length === 13 && search.startsWith("20")) {
        const decoded = ProductService.decodeLooseBarcode(search);
        if (decoded) {
          const productResult = await ProductService.findByLooseProductCode(decoded.productCode, storeId);
          if (productResult && productResult.length > 0) {
            const item = productResult[0];
            const pricePerUnit = item.price_per_unit || item.selling_price;
            const calculatedPrice = parseFloat((decoded.weightInKg * pricePerUnit).toFixed(2));

            const data = [{
              id: item.id,
              product_name: item.product_name,
              qty: decoded.weightInKg,
              selling_price: pricePerUnit,
              price: calculatedPrice,
              image: item.image ? `${baseUrl}/public/uploads/product/${item.image}` : null,
              barcode: item.barcode,
              sku: item.sku,
              brand: item.brand || '',
              category_name: '',
              stock: 0,
              min_qty: item.min_qty,
              offer_price: item.offer_price,
              offer_qty_price: item.offer_qty_price,
              tax: item.tax_rate,
              is_loose: 1,
              price_per_unit: pricePerUnit,
              loose_unit: item.loose_unit || 'kg',
              loose_weight: decoded.weightInKg,
              weighted_barcode: search,
            }];
            return sendResponse(resp, true, 200, "Loose item found", data);
          }
        }
      }

      const result=await ProductService.searchProductList(search, storeId)

      if(!result || result.length===0)
      {
        return sendResponse(resp,false,404,"No products found")
      }

      const data = result.map(item => ({
        id: item.id,
        product_name: item.product_name,
        qty: 1,
        selling_price: item.selling_price,
        price: item.selling_price,
        image: item.image
        ? `${baseUrl}/public/uploads/product/${item.image}`
        : null,
        barcode: item.barcode,
        sku: item.sku,
        brand: item.brand,
        category_name: item.category_name,
        stock: item.stock || 0,
        min_qty:item.min_qty,
        offer_price:item.offer_price,
        offer_qty_price:item.offer_qty_price,
        tax:item.tax_rate,
        favourite: item.favourite,
        is_loose: (item.is_loose === 1 || item.favourite === 'loose') ? 1 : 0,
        price_per_unit: item.price_per_unit || item.selling_price,
        loose_unit: item.loose_unit || 'kg',
        loose_product_code: item.loose_product_code,
      }));

      return sendResponse(resp,true,200,"Products found",data)
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
       const storeId = getStoreIdFromRequest(req);
       const {barcode,product_name,selling_price}=req.body
         const result = await ProductService.add({...req.body, store_id: storeId}, storeId);
         if (!result) {
           return sendResponse(resp, false, 400, "Something went wrong");
         }
         const getImage=await CommonModel.getSingle({table:"products",fields:['id','image'],conditions:{id:result}, storeId})

         const data={
           id:result,
           barcode,
           product_name,
           price:selling_price,
           qty:1,
           tax:0,
           image: (getImage && getImage.image)
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

   allProductsList: async (req, resp) => {
    try {
      const storeId = getStoreIdFromRequest(req);
      const result = await ProductService.allProductsList(storeId);

      if (!result || result.length === 0) {
        return sendResponse(resp, true, 200, "No products found", []);
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
        favourite: item.favourite,
        is_loose: (item.is_loose === 1 || item.favourite === 'loose') ? 1 : 0,
        price_per_unit: item.price_per_unit || item.selling_price,
        loose_unit: item.loose_unit || 'kg',
        loose_product_code: item.loose_product_code,
    }));
      return sendResponse(resp, true, 200, "Fetch all products", data);
    } catch (error) {
      return sendResponse(resp, false, 500, `Error :${error.message}`);
    }
  },

  favouriteList: async (req, resp) => {
    try {
      const storeId = getStoreIdFromRequest(req);
      console.log('backend-log favouriteList - storeId:', storeId);
      console.log('backend-log favouriteList - req.user:', req.user);
      const result = await ProductService.favouriteList(storeId);
      console.log('backend-log favouriteList - result:', result);

      if (!result || result.length === 0) {
        return sendResponse(resp, true, 200, "No favourite products found", []);
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
        favourite: item.favourite,
        is_loose: (item.is_loose === 1 || item.favourite === 'loose') ? 1 : 0,
        price_per_unit: item.price_per_unit || item.selling_price,
        loose_unit: item.loose_unit || 'kg',
    }));
      return sendResponse(resp, true, 200, "Fetch store data", data);
    } catch (error) {
      return sendResponse(resp, false, 500, `Error :${error.message}`);
    }
  },

  looseItemList: async (req, resp) => {
    try {
      const storeId = getStoreIdFromRequest(req);
      const result = await ProductService.looseItemList(storeId);

      if (!result || result.length === 0) {
        return sendResponse(resp, true, 200, "No loose items found", []);
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
        favourite: item.favourite,
        is_loose: 1,
        price_per_unit: item.price_per_unit || item.selling_price,
        loose_unit: item.loose_unit || 'kg',
        loose_product_code: item.loose_product_code,
    }));
      return sendResponse(resp, true, 200, "Fetch store data", data);
    } catch (error) {
      return sendResponse(resp, false, 500, `Error :${error.message}`);
    }
  },

  inventoryList: async (req, resp) => {
    try {
      const storeId = getStoreIdFromRequest(req);
      const result = await ProductService.inventoryList(storeId);

      if (!result || result.length === 0) {
        return sendResponse(resp, true, 200, "No products found", []);
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

  lowStockReport: async (req, resp) => {
    try {
      const storeId = getStoreIdFromRequest(req);
      const result = await ProductService.lowStockReport(storeId);

      if (!result || result.length === 0) {
        return sendResponse(resp, false, 400, "No Data Found");
      }

      const data = result.map(item => ({
        ...item,
        image: item.image ? `${baseUrl}/public/uploads/product/${item.image}` : null
      }));

      return sendResponse(resp, true, 200, "Fetch store data", data);
    } catch (error) {
      return sendResponse(resp, false, 500, `Error : ${error.message}`);
    }
  },

  // Generate weighted barcode for loose item
  generateLooseBarcode: async (req, resp) => {
    try {
      const { product_id, weight } = req.body;
      const storeId = getStoreIdFromRequest(req);

      if (!product_id) {
        return sendResponse(resp, false, 400, "product_id is required");
      }
      if (!weight || weight <= 0) {
        return sendResponse(resp, false, 400, "Valid weight is required");
      }

      // Get product details
      const product = await ProductService.getById(product_id, storeId);
      if (!product) {
        return sendResponse(resp, false, 404, "Product not found");
      }

      // Get or assign loose_product_code
      let productCode = product.loose_product_code;
      if (!productCode) {
        productCode = await ProductService.getNextLooseProductCode(storeId);
        // Save the code to the product
        await CommonModel.updateData({
          table: "products",
          data: { loose_product_code: productCode, is_loose: 1 },
          conditions: { id: product_id },
          storeId,
        });
      }

      const pricePerUnit = product.price_per_unit || product.selling_price;
      const calculatedPrice = parseFloat((weight * pricePerUnit).toFixed(2));

      // Generate the weighted barcode
      const barcode = ProductService.generateLooseBarcode(productCode, weight, pricePerUnit);

      // Save label record
      await CommonModel.insertData({
        table: "loose_item_labels",
        data: {
          product_id,
          weight,
          calculated_price: calculatedPrice,
          generated_barcode: barcode,
          store_id: storeId,
        },
      });

      const data = {
        barcode,
        product_name: product.product_name,
        weight: parseFloat(weight),
        unit: product.loose_unit || 'kg',
        price_per_unit: pricePerUnit,
        calculated_price: calculatedPrice,
        tax_rate: product.tax_rate,
        image: product.image ? `${baseUrl}/public/uploads/product/${product.image}` : null,
        product_id: product.id,
      };

      return sendResponse(resp, true, 200, "Barcode generated successfully", data);
    } catch (error) {
      return sendResponse(resp, false, 500, `Error: ${error.message}`);
    }
  },

  // Decode a scanned weighted barcode
  decodeLooseBarcode: async (req, resp) => {
    try {
      const { barcode } = req.body;
      const storeId = getStoreIdFromRequest(req);

      if (!barcode) {
        return sendResponse(resp, false, 400, "barcode is required");
      }

      const decoded = ProductService.decodeLooseBarcode(barcode);
      if (!decoded) {
        return sendResponse(resp, false, 400, "Invalid weighted barcode");
      }

      const productResult = await ProductService.findByLooseProductCode(decoded.productCode, storeId);
      if (!productResult || productResult.length === 0) {
        return sendResponse(resp, false, 404, "Loose product not found for this barcode");
      }

      const item = productResult[0];
      const pricePerUnit = item.price_per_unit || item.selling_price;
      const calculatedPrice = parseFloat((decoded.weightInKg * pricePerUnit).toFixed(2));

      const data = {
        id: item.id,
        product_name: item.product_name,
        qty: decoded.weightInKg,
        selling_price: pricePerUnit,
        price: calculatedPrice,
        image: item.image ? `${baseUrl}/public/uploads/product/${item.image}` : null,
        tax: item.tax_rate,
        is_loose: 1,
        price_per_unit: pricePerUnit,
        loose_unit: item.loose_unit || 'kg',
        loose_weight: decoded.weightInKg,
        weighted_barcode: barcode,
        min_qty: item.min_qty,
        offer_price: item.offer_price,
        offer_qty_price: item.offer_qty_price,
      };

      return sendResponse(resp, true, 200, "Loose item decoded successfully", data);
    } catch (error) {
      return sendResponse(resp, false, 500, `Error: ${error.message}`);
    }
  },

  addStock:async(req,resp)=>{
    try{
      const storeId = getStoreIdFromRequest(req);
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
          },
          storeId
        });
        return sendResponse(resp, true, 201, "Stock added successful");
      } catch (error) {
        return sendResponse(
          resp,
          false,
          500,
          error.message || "Something went wrong"
        );
      }
  }

};
