import { HoldAndRetrieveService } from "../services/HoldAndRetrieveService.js";
import {sendResponse} from "../utils/sendResponse.js"


export const HoldAndRetrieveController={
    list:async(req,resp)=>{
        try{
            const result=await HoldAndRetrieveService.list()
            if(!result || result.length===0)
            {
                return sendResponse(resp,false,400,"No Data Found")
            }
            return sendResponse(resp,true,200,"Fetch data successful",result)
        }catch(error)
        {
            return sendResponse(resp,false,500,`Error : ${error.message}`)
        }
    },

    holdsale:async(req,resp)=>{
      
        try {
            const requiredFields = [
            "customer_mobile","subtotal", "tax", "total","cart"
            ];
        
            for (let field of requiredFields) {
              if (!req.body[field]) {
                return sendResponse(resp, false, 400, `${field} is required`);
              }
            }
        
            const {
            customer_mobile,
           
              subtotal,
              tax,
              total,
              cart
            } = req.body;
        
            if (!Array.isArray(cart) || cart.length === 0) {
              return sendResponse(resp, false, 400, "cart cannot be empty");
            }
        
            const hold_code = await HoldAndRetrieveService.generateHoldNumber();
           const userId = req.user.userId;
                  const holdSale  = {
                    hold_code: hold_code,
                    user_id:userId,
                    customer_mobile,
                     subtotal,
                     tax,
                     total,
                  };
            const result = await HoldAndRetrieveService.holdSale(holdSale);
             
            if (!result) {
              return sendResponse(resp, false, 400, "Something went wrong");
            }
           
            for (const item of cart) {
              const itemData = {
                hold_sale_id: result,
                saleId: item.sale_id || 0,
        product_id: item.product_id,
        product_name: item.product_name,
        price: item.price,
        qty: item.qty,
        tax: item.tax,
        image: item.image,
        total: item.price * item.qty
              };
              await HoldAndRetrieveService.holdItem(itemData)
        }
            return sendResponse(resp, true, 201, "Hold Sale successful",hold_code);
          } catch (error) {
            return sendResponse(
              resp,
              false,
              500,
              error.message || "Something wennt Wrong"
            );
          }
    },

    retrieveCart: async (req, resp) => {
        try {
          const { customer_mobile } = req.body;
      
          if (!customer_mobile) {
            return sendResponse(resp, false, 400, "customer_mobile is required");
          }
      
          // 🔹 Fetch hold sale
          const sale = await HoldAndRetrieveService.retrieveHoldSale(customer_mobile);
         
          if (!sale) {
            return sendResponse(resp, false, 404, "Hold sale not found");
          }
      
          // 🔹 Fetch items
          const items = await HoldAndRetrieveService.retrieveHoldSaleItem(sale.id);
      
          return sendResponse(resp, true, 200, "Hold sale retrieved successfully", {
            sale,
            items: items || []
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

      retrieveHoldItem: async (req, resp) => {
        try {
          const {id}=req.params
          if(!id)
          return sendResponse(resp, false, 400, "id not found");
          const items = await HoldAndRetrieveService.retrieveHoldSaleItem(id);
          return sendResponse(resp, true, 200, "Hold sale retrieved successfully", {
            items: items || []
          });
      
        } catch (error) {
          return sendResponse(
            resp,
            false,
            500,
            error.message || "Something went wrong"
          );
        }
      }
      
   
}