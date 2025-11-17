import { PaymentService } from "../services/PaymentService.js"
import { sendResponse } from "../utils/sendResponse.js"

export const PaymentController={

   payment:async(req,resp)=>{
    try{
        const requiredFields=[
            'total_amount',
            'productId',
            'price',
            'qunatity',
        ]
        for(let fields of requiredFields)
        {
            if(!req.body[fields])
            {
                return sendResponse(resp,false,400,`${fields} is required`)
            }
        }
         const{total_amount,productId,price,quantity}=req.body
                const userId=req.user.userId;
                const orderId=await PaymentService.getNextOrderId()
                const saveData={
                    orderId:orderId,
                    userId:userId,
                    total_amount:total_amount,
                    payment_status:'Completed',
                    payment_date:new Date(),    
                }
                 const result= await PaymentService.order(saveData)
             const addtocart=await CommonModel.getAllData({table:'add_to_cart',conditions:{userId}}) 
                const order_id=result.id
                for(let item of addtocart){
                const order_detail={
                    orderId:order_id,
                    productId:item.productId,
                    price:item.price,
                    qunatity:item.quantity
                }
                const orderDetail= await PaymentService.order_detail(order_detail)
                const add_to_cart_id=item.id;
                const deleteData=await CommonModel.deleteData({table:'add_to_cart',conditions:{add_to_cart_id}})
            }
                if(!result)
                {
                    return sendResponse(resp,false,400,"Something went wrong")
                }
                return sendResponse(resp,true,201,"Your Payment Completed successfully")
        
    }catch(error)
    {
        return sendResponse(resp,false,500,`Error L ${error.message}`)
    }

   },
}