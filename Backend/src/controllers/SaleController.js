import { SaleService } from "../services/SaleService.js";
import {sendResponse} from "../utils/sendResponse.js"
import {CommonModel} from "../models/CommonModel.js"
import crypto from "crypto"
import razorpay from "../config/razorpay.js"
export const SaleController={
    list:async(req,resp)=>{
        try{
            const result=await SaleService.list()
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

    checkoutSale:async(req,resp)=>{
      
        try {
            const requiredFields = [
             "subtotal", "tax", "total","payment_method","cart"
            ];
        
            for (let field of requiredFields) {
              if (!req.body[field]) {
                return sendResponse(resp, false, 400, `${field} is required`);
              }
            }
        
            const {
              subtotal,
              tax,
              total,
              payment_method,
              cart
            } = req.body;
        
            if (!Array.isArray(cart) || cart.length === 0) {
              return sendResponse(resp, false, 400, "cart cannot be empty");
            }
        
            const invoice_no = await SaleService.generateInvoice();
              const userId = req.user.userId;

                  const saleData = {
                    invoice_no: invoice_no,
                    user_id:userId,
                     subtotal,
                     tax,
                     total,
                     payment_method,
                     payment_status:payment_method === "cash" ? "paid" : "pending"
                  };
            const saleId = await SaleService.createSale(saleData);
             
            if (!saleId) {
              return sendResponse(resp, false, 400, "Something went wrong");
            }
           
            for (const item of cart) {

              const itemData = {
                sale_id: saleId,
        product_id: item.product_id,
        product_name: item.product_name,
        price: item.price,
        tax: item.tax,
        qty: item.qty,
        image: item.image,
        total: item.price * item.qty
              };
         await SaleService.createSaleItem(itemData)
         await CommonModel.insertData({
          table: "stocks",
         data: {
            product_id: item.product_id,
            stock: item.qty,
            type:'debit',
            note:'Sale',
          }
        });
        }
        const getData = await CommonModel.getSingle({
          table: "hold_sales",
          conditions: { user_id: userId }
        });
        
        if (getData) {
        
          // 1️⃣ Delete items first
          await CommonModel.deleteData({
            table: "hold_sale_items",
            conditions: { hold_sale_id: getData.id }
          });
        
          // 2️⃣ Then delete hold sale
          await CommonModel.deleteData({
            table: "hold_sales",
            conditions: { id: getData.id }
          });
        }
        
        if (payment_method === "cash") {
          return sendResponse(resp, true, 201, "Sale completed successfully",saleData);
        }
        else{
        const order = await razorpay.orders.create({
          amount: Math.round(total * 100),
          currency: "INR",
          receipt: `sale_${saleId}`,
        });
        const data={
          razorpayOrderId: order.id,
            saleId,
            amount:total,
          }
          const invoiceData={
            saleData,
            data
          }
          return sendResponse(resp, true, 201, "Sale completed successfully",invoiceData);
      }
          } catch (error) {
            console.error("❌ Checkout Sale Error:", error);
            return sendResponse(
              resp,
              false,
              500,
              error.message || "Something wennt Wrong"
            );
          }
    },

    verifyPayment:async(req,resp)=>{
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        saleId,
        amount,
      } = req.body;
    
      const body = razorpay_order_id + "|" + razorpay_payment_id;
    
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");
    
      if (expectedSignature !== razorpay_signature) {
        await CommonModel.rawQuery(`
          UPDATE sales SET payment_status='failed' WHERE id=?`,
          [saleId]
        );
        return sendResponse(resp,false,400,"No Data found")
      }
    
      // ✅ Mark Paid
      await CommonModel.rawQuery(`
        UPDATE sales SET payment_status='paid' WHERE id=?`,
        [saleId]
      );
    
      await CommonModel.rawQuery(
        `INSERT INTO payments 
         (sale_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          saleId,
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          amount,
          "paid"
        ]
      );
     
     return sendResponse(resp,true,201,"Payment successful")
      
    },

    getSaleById: async (req, res) => {
        try {
          const { id } = req.params;
            if(!id)
            {
                return sendResponse(resp,false,400,"id not found")
            }
          const sale = await SaleService.getSaleById(id);
      
          if (!sale) {
            return sendResponse(res, false, 404, "Sale not found");
          }
      
          const items = await CommonModel.getAllData({
            table: 'sales_items',
            conditions: { sale_id: id,is_returned:'no' }
          });
      
          return sendResponse(res, true, 200, "Sale details", {
            sale,
            items
          });
      
        } catch (error) {
          return sendResponse(res, false, 500, error.message);
        }
      },


      saleReport:async(req,resp)=>{
        try{
            const result=await SaleService.saleReport()
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

      findSale: async (req, res) => {
          try{
        const { invoice_no } = req.body;
      
        const sale = await SaleService.getSale(invoice_no);
        if (!sale) {
          return sendResponse(res, false, 404, "Sale not found");
        }
        if (!sale) return sendResponse(res,false,404,"Sale not found");
        const items = await CommonModel.getAllData({
            table: 'sales_items',
            conditions: { sale_id: sale.id }
          });
       
        return sendResponse(res,true,200,"Sale fetched",{ sale, items });
    }catch(error)
    {
       return  sendResponse(res,true,500,`${error.message}`);

    }
      },
     
      transactionList:async(req,resp)=>{
        try{
            const result=await SaleService.transactionList()
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

   
}