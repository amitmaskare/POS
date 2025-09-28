export const sendResponse=(resp,boolenStatus=false,statusCode=400,message="Something went wrong",data=[])=>{
    resp.status(statusCode).send({
        status:boolenStatus,
        message:message,
        data:data
    })
}